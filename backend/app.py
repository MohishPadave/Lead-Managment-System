from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
import csv
import io
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# CORS configuration for production
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app, resources={
    r"/api/*": {
        "origins": [frontend_url, "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Mock user database
USERS = [
    {'id': 1, 'email': 'admin@example.com', 'password': 'admin123', 'username': 'admin', 'name': 'Admin User'},
    {'id': 2, 'email': 'mohan@example.com', 'password': 'mohan123', 'username': 'mohan', 'name': 'Mohan Kumar'},
    {'id': 3, 'email': 'ravi@example.com', 'password': 'ravi123', 'username': 'ravi', 'name': 'Ravi Singh'},
]

# In-memory leads storage with timestamps
leads_db = [
    {'id': 1, 'name': 'John Doe', 'email': 'john@example.com', 'phone': '555-0101', 'status': 'New', 'created_at': '2025-11-01T10:00:00Z', 'watchers': [1]},
    {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com', 'phone': '555-0102', 'status': 'In Progress', 'created_at': '2025-11-02T11:00:00Z', 'watchers': [1, 2]},
    {'id': 3, 'name': 'Bob Johnson', 'email': 'bob@example.com', 'phone': '555-0103', 'status': 'Converted', 'created_at': '2025-11-03T12:00:00Z', 'watchers': [1]},
]
next_lead_id = 4

# In-memory notes storage
notes_db = []
next_note_id = 1

# Mentions storage
mentions_db = []
next_mention_id = 1

# Notifications storage
notifications_db = []
next_notification_id = 1

# Activity timeline storage
activities_db = []
next_activity_id = 1

# Read receipts storage
read_receipts_db = []

# Helper functions
import re

def extract_mentions(text):
    """Extract @username mentions from text"""
    return re.findall(r'@(\w+)', text)

def create_activity(lead_id, user_id, action, details=None):
    """Create an activity log entry"""
    global next_activity_id
    activity = {
        'id': next_activity_id,
        'lead_id': lead_id,
        'user_id': user_id,
        'user_name': next((u['name'] for u in USERS if u['id'] == user_id), 'Unknown'),
        'action': action,
        'details': details or {},
        'created_at': datetime.datetime.now(datetime.UTC).isoformat()
    }
    activities_db.append(activity)
    next_activity_id += 1
    return activity

def create_notification(user_id, lead_id, type, message, related_id=None):
    """Create a notification for a user"""
    global next_notification_id
    notification = {
        'id': next_notification_id,
        'user_id': user_id,
        'lead_id': lead_id,
        'type': type,
        'message': message,
        'related_id': related_id,
        'read': False,
        'created_at': datetime.datetime.now(datetime.UTC).isoformat()
    }
    notifications_db.append(notification)
    next_notification_id += 1
    return notification

def notify_watchers(lead_id, message, exclude_user_id=None, related_id=None):
    """Notify all watchers of a lead"""
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return
    
    watchers = lead.get('watchers', [])
    for watcher_id in watchers:
        if watcher_id != exclude_user_id:
            create_notification(watcher_id, lead_id, 'watcher_update', message, related_id)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = next((u for u in USERS if u['id'] == data['user_id']), None)
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = next((u for u in USERS if u['email'] == email and u['password'] == password), None)
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'username': user['username'],
            'name': user['name']
        }
    }), 200

@app.route('/api/leads', methods=['GET'])
@token_required
def get_leads(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    q = request.args.get('q', '').lower()
    status = request.args.get('status', '')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_dir = request.args.get('sort_dir', 'desc')
    
    # Filter leads
    filtered_leads = leads_db
    
    # Search filter
    if q:
        filtered_leads = [
            lead for lead in filtered_leads
            if q in lead['name'].lower() or 
               q in lead['email'].lower() or 
               q in lead['phone'].lower()
        ]
    
    # Status filter
    if status:
        filtered_leads = [lead for lead in filtered_leads if lead['status'] == status]
    
    # Sorting
    reverse = (sort_dir == 'desc')
    if sort_by in ['name', 'email', 'status', 'created_at']:
        filtered_leads = sorted(filtered_leads, key=lambda x: x.get(sort_by, ''), reverse=reverse)
    
    # Pagination
    total = len(filtered_leads)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_leads = filtered_leads[start:end]
    
    return jsonify({
        'leads': paginated_leads,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page if total > 0 else 0
    }), 200

@app.route('/api/leads', methods=['POST'])
@token_required
def create_lead(current_user):
    global next_lead_id
    data = request.get_json()
    
    # Validation
    if not data.get('name') or not data.get('email'):
        return jsonify({'message': 'Name and email are required'}), 400
    
    new_lead = {
        'id': next_lead_id,
        'name': data.get('name'),
        'email': data.get('email'),
        'phone': data.get('phone', ''),
        'status': data.get('status', 'New'),
        'created_at': datetime.datetime.now(datetime.UTC).isoformat(),
        'watchers': [current_user['id']]  # Creator is automatically a watcher
    }
    
    leads_db.append(new_lead)
    
    # Log activity
    create_activity(next_lead_id, current_user['id'], 'created', {
        'lead_name': new_lead['name'],
        'status': new_lead['status']
    })
    
    next_lead_id += 1
    
    return jsonify(new_lead), 201

@app.route('/api/leads/<int:lead_id>', methods=['PUT'])
@token_required
def update_lead(current_user, lead_id):
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    data = request.get_json()
    old_status = lead['status']
    
    lead['name'] = data.get('name', lead['name'])
    lead['email'] = data.get('email', lead['email'])
    lead['phone'] = data.get('phone', lead['phone'])
    lead['status'] = data.get('status', lead['status'])
    
    # Log activity
    if old_status != lead['status']:
        create_activity(lead_id, current_user['id'], 'status_changed', {
            'old_status': old_status,
            'new_status': lead['status']
        })
        notify_watchers(lead_id, f"Status changed from {old_status} to {lead['status']}", current_user['id'])
    else:
        create_activity(lead_id, current_user['id'], 'updated', {
            'fields': list(data.keys())
        })
        notify_watchers(lead_id, f"Lead updated by {current_user['name']}", current_user['id'])
    
    return jsonify(lead), 200

@app.route('/api/leads/<int:lead_id>', methods=['DELETE'])
@token_required
def delete_lead(current_user, lead_id):
    global leads_db
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    leads_db = [l for l in leads_db if l['id'] != lead_id]
    
    return jsonify({'message': 'Lead deleted'}), 200

@app.route('/api/leads/export', methods=['GET'])
@token_required
def export_leads(current_user):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=['id', 'name', 'email', 'phone', 'status', 'created_at'])
    writer.writeheader()
    writer.writerows(leads_db)
    
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='leads.csv'
    )

@app.route('/api/leads/import', methods=['POST'])
@token_required
def import_leads(current_user):
    global next_lead_id
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'message': 'File must be a CSV'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode('utf-8'))
        reader = csv.DictReader(stream)
        
        imported_count = 0
        errors = []
        
        for row in reader:
            # Validation
            if not row.get('name') or not row.get('email'):
                errors.append(f"Row skipped: missing name or email")
                continue
            
            new_lead = {
                'id': next_lead_id,
                'name': row['name'],
                'email': row['email'],
                'phone': row.get('phone', ''),
                'status': row.get('status', 'New'),
                'created_at': datetime.datetime.now(datetime.UTC).isoformat()
            }
            
            leads_db.append(new_lead)
            next_lead_id += 1
            imported_count += 1
        
        return jsonify({
            'message': f'Imported {imported_count} leads',
            'imported': imported_count,
            'errors': errors
        }), 200
    
    except Exception as e:
        return jsonify({'message': f'Error processing CSV: {str(e)}'}), 400

@app.route('/api/leads/<int:lead_id>/notes', methods=['GET'])
@token_required
def get_lead_notes(current_user, lead_id):
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    lead_notes = [note for note in notes_db if note['lead_id'] == lead_id]
    return jsonify({'notes': lead_notes}), 200

@app.route('/api/leads/<int:lead_id>/notes', methods=['POST'])
@token_required
def add_lead_note(current_user, lead_id):
    global next_note_id
    
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    data = request.get_json()
    if not data.get('content'):
        return jsonify({'message': 'Note content is required'}), 400
    
    new_note = {
        'id': next_note_id,
        'lead_id': lead_id,
        'user_id': current_user['id'],
        'user_name': current_user['name'],
        'content': data['content'],
        'created_at': datetime.datetime.now(datetime.UTC).isoformat()
    }
    
    notes_db.append(new_note)
    
    # Extract and process mentions
    mentions = extract_mentions(data['content'])
    global next_mention_id
    for username in mentions:
        mentioned_user = next((u for u in USERS if u['username'] == username), None)
        if mentioned_user:
            # Create mention record
            mention = {
                'id': next_mention_id,
                'note_id': next_note_id,
                'mentioned_user_id': mentioned_user['id'],
                'mentioned_by_user_id': current_user['id'],
                'created_at': datetime.datetime.now(datetime.UTC).isoformat()
            }
            mentions_db.append(mention)
            next_mention_id += 1
            
            # Create notification
            create_notification(
                mentioned_user['id'],
                lead_id,
                'mention',
                f"{current_user['name']} mentioned you in a note",
                next_note_id
            )
    
    # Log activity
    create_activity(lead_id, current_user['id'], 'note_added', {
        'note_preview': data['content'][:50] + '...' if len(data['content']) > 50 else data['content']
    })
    
    # Notify watchers
    notify_watchers(lead_id, f"{current_user['name']} added a note", current_user['id'], next_note_id)
    
    next_note_id += 1
    
    return jsonify(new_note), 201

@app.route('/api/leads/<int:lead_id>/notes/<int:note_id>', methods=['DELETE'])
@token_required
def delete_lead_note(current_user, lead_id, note_id):
    global notes_db
    
    note = next((n for n in notes_db if n['id'] == note_id and n['lead_id'] == lead_id), None)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    notes_db = [n for n in notes_db if n['id'] != note_id]
    return jsonify({'message': 'Note deleted'}), 200

# Watchers endpoints
@app.route('/api/leads/<int:lead_id>/watchers', methods=['GET'])
@token_required
def get_watchers(current_user, lead_id):
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    watcher_ids = lead.get('watchers', [])
    watchers = [{'id': u['id'], 'name': u['name'], 'username': u['username']} 
                for u in USERS if u['id'] in watcher_ids]
    
    return jsonify({'watchers': watchers}), 200

@app.route('/api/leads/<int:lead_id>/watchers', methods=['POST'])
@token_required
def add_watcher(current_user, lead_id):
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    data = request.get_json()
    user_id = data.get('user_id', current_user['id'])
    
    if 'watchers' not in lead:
        lead['watchers'] = []
    
    if user_id not in lead['watchers']:
        lead['watchers'].append(user_id)
        create_activity(lead_id, current_user['id'], 'watcher_added', {
            'watcher_name': next((u['name'] for u in USERS if u['id'] == user_id), 'Unknown')
        })
    
    return jsonify({'message': 'Watcher added'}), 200

@app.route('/api/leads/<int:lead_id>/watchers/<int:user_id>', methods=['DELETE'])
@token_required
def remove_watcher(current_user, lead_id, user_id):
    lead = next((l for l in leads_db if l['id'] == lead_id), None)
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    if 'watchers' in lead and user_id in lead['watchers']:
        lead['watchers'].remove(user_id)
        create_activity(lead_id, current_user['id'], 'watcher_removed', {
            'watcher_name': next((u['name'] for u in USERS if u['id'] == user_id), 'Unknown')
        })
    
    return jsonify({'message': 'Watcher removed'}), 200

# Activity timeline endpoints
@app.route('/api/leads/<int:lead_id>/activities', methods=['GET'])
@token_required
def get_activities(current_user, lead_id):
    lead_activities = [a for a in activities_db if a['lead_id'] == lead_id]
    lead_activities.sort(key=lambda x: x['created_at'], reverse=True)
    
    return jsonify({'activities': lead_activities}), 200

# Notifications endpoints
@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    user_notifications = [n for n in notifications_db if n['user_id'] == current_user['id']]
    user_notifications.sort(key=lambda x: x['created_at'], reverse=True)
    
    # Get lead names
    for notif in user_notifications:
        lead = next((l for l in leads_db if l['id'] == notif['lead_id']), None)
        if lead:
            notif['lead_name'] = lead['name']
    
    return jsonify({'notifications': user_notifications}), 200

@app.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notif_id):
    notif = next((n for n in notifications_db if n['id'] == notif_id and n['user_id'] == current_user['id']), None)
    if not notif:
        return jsonify({'message': 'Notification not found'}), 404
    
    notif['read'] = True
    return jsonify(notif), 200

@app.route('/api/notifications/read-all', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    for notif in notifications_db:
        if notif['user_id'] == current_user['id']:
            notif['read'] = False
    
    return jsonify({'message': 'All notifications marked as read'}), 200

# Read receipts endpoints
@app.route('/api/leads/<int:lead_id>/notes/<int:note_id>/read', methods=['POST'])
@token_required
def mark_note_read(current_user, lead_id, note_id):
    # Check if already read
    existing = next((r for r in read_receipts_db 
                    if r['note_id'] == note_id and r['user_id'] == current_user['id']), None)
    
    if not existing:
        receipt = {
            'note_id': note_id,
            'user_id': current_user['id'],
            'user_name': current_user['name'],
            'read_at': datetime.datetime.now(datetime.UTC).isoformat()
        }
        read_receipts_db.append(receipt)
    
    return jsonify({'message': 'Note marked as read'}), 200

@app.route('/api/leads/<int:lead_id>/notes/<int:note_id>/receipts', methods=['GET'])
@token_required
def get_read_receipts(current_user, lead_id, note_id):
    receipts = [r for r in read_receipts_db if r['note_id'] == note_id]
    return jsonify({'receipts': receipts}), 200

# Users endpoint for mentions autocomplete
@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
    users_list = [{'id': u['id'], 'username': u['username'], 'name': u['name']} for u in USERS]
    return jsonify({'users': users_list}), 200

# For Vercel serverless deployment
handler = app

if __name__ == '__main__':
    app.run(debug=True, port=5001)
