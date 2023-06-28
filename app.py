import datetime
import json
import smtplib
import sqlite3
from email.mime.text import MIMEText
from flask import jsonify
from flask import Flask, render_template, request, redirect, session, flash

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Change this to a secure secret key


# Get database connection
def get_db_connection():
    conn = sqlite3.connect('workflows.db')
    conn.row_factory = sqlite3.Row
    return conn


# Check login status
def check_login():
    return 'username' in session and 'role' in session


def get_workflow_template_from_db(template_id):
    conn = sqlite3.connect('workflows.db')
    cursor = conn.cursor()

    # Fetch the workflow template JSON from the database based on the template ID
    cursor.execute('SELECT canvas_data FROM workflows WHERE id = ?', (template_id,))
    template_json = cursor.fetchone()[0]

    conn.close()

    # Convert the retrieved JSON string back to a dictionary
    template_dict = json.loads(template_json)
    return template_dict


def mark_workflow_as_template(template_id):
    conn = sqlite3.connect('workflows.db')
    cursor = conn.cursor()

    # Update the database to mark the selected template as a "Template"
    cursor.execute('UPDATE workflows SET is_template = 1 WHERE id = ?', (template_id,))

    conn.commit()
    conn.close()


def get_template_workflows_from_db(search_query):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Execute the SQL query to retrieve template workflows based on the search query
    cursor.execute("SELECT * FROM workflows WHERE is_template = 1 AND name LIKE ?", ('%' + search_query + '%',))
    template_workflows = cursor.fetchall()

    conn.close()

    return template_workflows


def get_workflow_from_db(workflow_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Execute the SQL query to retrieve the workflow based on the workflow ID
    cursor.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    workflow = cursor.fetchone()

    conn.close()

    return workflow


def send_email(to_email, subject, message):
    # SMTP server configuration (update with your own values)
    smtp_host = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = 'User.For.Testing.Purposes@gmail.com'
    smtp_password = 'xoomrloakvfmzfut'

    # Create a MIME message object
    msg = MIMEText(message)
    msg['Subject'] = subject
    msg['From'] = smtp_username
    msg['To'] = to_email

    try:
        # Connect to the SMTP server
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()

        # Login to the SMTP server
        server.login(smtp_username, smtp_password)

        # Send the email
        server.send_message(msg)

        # Disconnect from the SMTP server
        server.quit()

        # Return True to indicate successful email sending
        return True
    except Exception as e:
        # Print any error messages or handle exceptions as needed
        print(f"Error sending email: {str(e)}")
        return False


def save_object_to_database(object_id, recipient, subject, body):
    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the object_id already exists
        cursor.execute("SELECT object_id FROM Sendmailinfo WHERE object_id = ?", (object_id,))
        existing_record = cursor.fetchone()
        if existing_record:
            print("Object with object_id already exists.")
            return False

        # Insert the object data into the table
        cursor.execute("INSERT INTO Sendmailinfo (object_id, recipient, subject, body) VALUES (?, ?, ?, ?)",
                       (object_id, recipient, subject, body))

        # Commit the transaction and close the connection
        conn.commit()
        conn.close()

        return True
    except sqlite3.Error as e:
        print("Error saving object to the database:", e)
        return False


@app.route('/')
def main_page():
    return render_template('main.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
        user = cursor.fetchone()

        conn.close()

        if user:
            session['username'] = user['username']
            session['role'] = user['role']
            # After authenticating the user and verifying their credentials
            session['user_id'] = user['id']

            if user['role'] == 'user':
                return redirect('/user-dashboard')
            elif user['role'] == 'admin':
                return redirect('/admin-dashboard')
        else:
            return render_template('login.html', error_message='Invalid username or password')

    return render_template('login.html')


@app.route('/edit-workflow/<int:workflow_id>', methods=['GET', 'POST'])
def edit_workflow(workflow_id):
    if check_login() and (session['role'] == 'user' or session['role'] == 'admin'):
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM workflows WHERE id = ?', (workflow_id,))
        workflow = cursor.fetchone()

        conn.close()

        if workflow:
            if request.method == 'POST':
                workflow_name = request.form['workflow_name']
                # Update the workflow name in the database
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('UPDATE workflows SET name = ? WHERE id = ?', (workflow_name, workflow_id))
                conn.commit()
                conn.close()
                flash('Workflow updated successfully', 'success')
                return redirect('/user-dashboard')

            return render_template('edit_workflow.html', workflow=workflow,
                                   update_workflow_url=f'/update-workflow/{workflow_id}')

        flash('Workflow not found', 'error')
        return redirect('/user-dashboard')

    return redirect('/login')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle the form submission
        username = request.form['username']
        password = request.form['password']
        role = 'admin'  # Set the role as 'admin' for all registered users

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('INSERT INTO users (username, password, role, is_deleted) VALUES (?, ?, ?, ?)',
                       (username, password, role, 0))

        conn.commit()
        conn.close()

        return redirect('/login')
    else:
        # Handle the GET request
        return render_template('register.html')


@app.route('/user-dashboard')
def user_dashboard():
    if check_login() and session['role'] == 'user':
        return render_template('user_dashboard.html')
    else:
        return redirect('/login')


@app.route('/admin-dashboard')
def admin_dashboard():
    if check_login() and session['role'] == 'admin':
        return render_template('admin_dashboard.html')
    else:
        return redirect('/login')


@app.route('/user-data/<int:user_id>')
def user_data(user_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()

        conn.close()

        return render_template('user_data.html', user=user)
    else:
        return redirect('/login')


@app.route('/create-workflow', methods=['GET', 'POST'])
def create_workflow():
    if check_login() and (session['role'] == 'user' or session['role'] == 'admin'):
        if request.method == 'POST':
            # Retrieve the workflow data from the form
            workflow_data = request.get_json()
            canvas_data = workflow_data.get('canvasData')
            workflow_name = workflow_data.get('workflow_name')
            conn = get_db_connection()
            cursor = conn.cursor()

            # Retrieve the user ID from the session
            user_id = session['user_id']

            # Insert the workflow data and user ID into the database
            cursor.execute(
                'INSERT INTO workflows (name, canvas_data, status, created_at, is_approved, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                (workflow_name, canvas_data, 'active', datetime.datetime.now(), 0, user_id))

            conn.commit()
            conn.close()

            return redirect('/user-dashboard')

        workflow_data = request.args.get('workflow_data')
        if workflow_data:
            workflow_row = json.loads(workflow_data)
            workflow_dict = {
                'id': workflow_row['id'],
                'name': workflow_row['name'],
                'canvas_data': workflow_row['canvas_data'],
                # Add other columns as needed
            }
            return render_template('create_workflow.html', workflow=workflow_dict)

        return render_template('create_workflow.html')
    else:
        return redirect('/login')


@app.route('/mark-as-template/<int:workflow_id>')
def mark_as_template(workflow_id):
    mark_workflow_as_template(workflow_id)
    flash('Workflow marked as template successfully', 'success')
    return redirect('/admin-dashboard')


@app.route('/approve-workflows/<workflow_id>')
def approve_workflow(workflow_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the workflow's approval status
        cursor.execute('UPDATE workflows SET is_approved = 1 WHERE id = ?', (workflow_id,))

        conn.commit()
        conn.close()

        return redirect('/modify-workflows')
    else:
        return redirect('/login')


@app.route('/reject-workflow/<workflow_id>')
def reject_workflow(workflow_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the workflow's approval status
        cursor.execute('UPDATE workflows SET is_approved = 2 WHERE id = ?', (workflow_id,))

        conn.commit()
        conn.close()

        return redirect('/modify-workflows')
    else:
        return redirect('/login')


@app.route('/delete-user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))

        conn.commit()
        conn.close()

        return redirect('/user-management')
    else:
        return redirect('/login')


@app.route('/view-workflow/<workflow_id>')
def view_workflow(workflow_id):
    if check_login():
        conn = get_db_connection()
        cursor = conn.cursor()

        # Retrieve the workflow data from the database
        cursor.execute('SELECT * FROM workflows WHERE id = ?', (workflow_id,))
        workflow = cursor.fetchone()

        conn.close()

        return render_template('view_workflow.html', workflow=workflow)
    else:
        return redirect('/login')


@app.route('/pending-workflows')
def pending_workflows():
    if check_login() and (session['role'] == 'user' or session['role'] == 'admin'):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workflows WHERE is_approved = 0')
        workflows = cursor.fetchall()

        conn.close()

        return render_template('pending_workflows.html', workflows=workflows)
    else:
        return redirect('/login')


@app.route('/send-mail', methods=['POST'])
def send_mail():
    if check_login():
        if request.method == 'POST':
            to_email = request.form.get('to_email')
            subject = request.form.get('subject')
            message = request.form.get('message')

            # Send the email
            if send_email(to_email, subject, message):
                return {'success': True}
            else:
                return {'success': False}
    return redirect('/login')


@app.route('/approved-workflows')
def approved_workflows():
    if check_login() and (session['role'] == 'user' or session['role'] == 'admin'):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workflows WHERE is_approved = 1')
        workflows = cursor.fetchall()

        conn.close()

        return render_template('approved_workflows.html', workflows=workflows)
    else:
        return redirect('/login')


@app.route('/user-management')
def user_management():
    if check_login() and session['role'] == 'admin':
        # Retrieve user data from the database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users')
        users = cursor.fetchall()
        conn.close()

        return render_template('user_management.html', users=users)
    else:
        return redirect('/login')


@app.route('/template-search')
def template_search():
    search_query = request.args.get('search_query', '')  # Get the search query from the request parameters

    # Retrieve template workflows from the database based on the search query
    template_workflows = get_template_workflows_from_db(search_query)

    return render_template('template_search.html', template_workflows=template_workflows)


@app.route('/modify-workflows')
def modify_workflows():
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        # Retrieve the modified workflows
        cursor.execute('SELECT * FROM workflows WHERE is_approved = 0 AND is_modified = 1')
        modified_workflows = cursor.fetchall()

        conn.close()

        return render_template('modify_workflows.html', modified_workflows=modified_workflows)
    else:
        return redirect('/login')


@app.route('/search-workflow', methods=['GET', 'POST'])
def search_workflow():
    if check_login():
        if request.method == 'POST':
            search_query = request.form['search_query']
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM workflows WHERE name LIKE ?', ('%' + search_query + '%',))
            workflows = cursor.fetchall()

            conn.close()

            return render_template('search_workflow.html', workflows=workflows, search_query=search_query)

        return render_template('search_workflow.html')
    else:
        return redirect('/login')


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')


@app.route('/create-user', methods=['GET', 'POST'])
def create_user():
    if check_login() and session['role'] == 'admin':
        if request.method == 'POST':
            # Get the user data from the form submission
            username = request.form['username']
            password = request.form['password']
            role = request.form['role']
            department = request.form['department']

            conn = get_db_connection()
            cursor = conn.cursor()

            # Insert the user data into the database
            cursor.execute('INSERT INTO users (username, password, role, department) VALUES (?, ?, ?, ?)',
                           (username, password, role, department))

            conn.commit()
            conn.close()

            return redirect('/user-management')

        return render_template('create_user.html')  # Create an HTML template for the user creation form
    else:
        return redirect('/login')


@app.route('/edit-user/<user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    if request.method == 'POST':
        # Get the form data
        fullname = request.form['fullname']
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']
        department = request.form['department']

        # Connect to the SQLite database
        conn = sqlite3.connect('workflows.db')
        cursor = conn.cursor()

        # Update the user's information in the database
        cursor.execute("UPDATE users SET fullname=?, username=?, password=?, role=?, department=? WHERE id=?",
                       (fullname, username, password, role, department, int(user_id)))
        conn.commit()

        # Close the database connection
        conn.close()

        # Redirect to the user management page
        return redirect('/user-management')

    else:
        # Connect to the SQLite database
        conn = sqlite3.connect('workflows.db')
        conn = sqlite3.connect('workflows.db')
        cursor = conn.cursor()

        # Fetch the user data from the database based on the user_id
        cursor.execute("SELECT * FROM users WHERE id=?", (int(user_id),))
        user = cursor.fetchone()

        # Close the database connection
        conn.close()

        if user:
            # Convert the user tuple to a dictionary
            user_dict = {
                'id': user[0],
                'fullname': user[1],
                'username': user[2],
                'password': user[3],
                'role': user[4],
                'department': user[5]
            }

            # Render the edit user template with the user data
            return render_template('edit_user.html', user=user_dict)
        else:
            # Handle the case when the user is not found in the database
            # You can redirect or show an error message
            return redirect('/user-management')  # or return render_template('error.html', message='User not found')


@app.route('/save-object', methods=['POST'])
def save_object():
    data = request.get_json()
    object_id = data.get('object_id', 'default_object_id')
    recipient = data.get('recipient', 'default_recipient')
    subject = data.get('subject', 'default_subject')
    body = data.get('body', 'default_body')

    # Save the object data to the database
    success = save_object_to_database(object_id, recipient, subject, body)

    # Return a JSON response with the success status
    return jsonify({'success': success})


if __name__ == '__main__':
    app.run(debug=True)
