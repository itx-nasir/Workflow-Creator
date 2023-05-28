from flask import Flask, render_template, request, redirect, session
import sqlite3
import datetime
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


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('INSERT INTO users (username, password, role,is_deleted) VALUES (?, ?, ?,?)',
                       (username, password, role,0))

        conn.commit()
        conn.close()

        return redirect('/login')

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


@app.route('/user-management')
def user_management():
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM users WHERE is_deleted = 0')
        users = cursor.fetchall()
        cursor.execute('SELECT * FROM users WHERE is_deleted = 1')
        deleted_users = cursor.fetchall()
        conn.close()

        return render_template('user_management.html', users=users, deleted_users=deleted_users)
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
    if check_login() and session['role'] == 'user':
        if request.method == 'POST':
            workflow_data = request.get_json()
            canvas_data = workflow_data.get('canvasData')
            workflow_name = workflow_data.get('workflow_name')  
            conn = get_db_connection()
            cursor = conn.cursor()

            # Retrieve the user ID from the session
            user_id = session['user_id']

            # Insert the workflow data and user ID into the database
            cursor.execute('INSERT INTO workflows (name, canvas_data, status, created_at, is_approved, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                           (workflow_name, canvas_data, 'active', datetime.datetime.now(), 0, user_id))

            conn.commit()
            conn.close()

            return redirect('/user-dashboard')

        return render_template('create_workflow.html')
    else:
        return redirect('/login')



@app.route('/approve-workflows')
def approve_workflows():
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM workflows WHERE is_approved = 0')
        workflows = cursor.fetchall()

        conn.close()

        return render_template('approve_workflows.html', workflows=workflows)
    else:
        return redirect('/login')


@app.route('/approve-workflow/<workflow_id>')
def approve_workflow(workflow_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('UPDATE workflows SET is_approved = 1 WHERE id = ?', (workflow_id,))

        conn.commit()
        conn.close()

        return redirect('/approve-workflows')
    else:
        return redirect('/login')

@app.route('/delete-user/<user_id>')
def delete_user(user_id):
    if check_login() and session['role'] == 'admin':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('UPDATE users SET is_deleted = 1 WHERE id = ?', (user_id,))

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
    if check_login() and session['role'] == 'user':
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workflows WHERE is_approved = 0')
        workflows = cursor.fetchall()

        conn.close()

        return render_template('pending_workflows.html', workflows=workflows)
    else:
        return redirect('/login')


@app.route('/approved-workflows')
def approved_workflows():
    if check_login():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workflows WHERE is_approved = 1')
        workflows = cursor.fetchall()

        conn.close()

        return render_template('approved_workflows.html', workflows=workflows)
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
    return redirect('/')


if __name__ == '__main__':
    app.run(debug=True)
