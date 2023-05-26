
# import sqlite3

# # # Database initialization
# # def init_db():
# #     conn = get_db_connection()
# #     cursor = conn.cursor()
# #     cursor.execute(
# #         '''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL)'''
# #     )
# #     cursor.execute(
# #         '''CREATE TABLE IF NOT EXISTS workflows (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, status TEXT NOT NULL)'''
# #     )

# #     cursor.execute('''
# #         INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)
# #     ''', ('admin', 'admin', 'admin'))
# #     conn.commit()
# #     conn.close()


# # Get database connection
# def get_db_connection():
#     conn = sqlite3.connect('workflows.db')
#     conn.row_factory = sqlite3.Row
#     return conn

import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('workflows.db')
cursor = conn.cursor()

# Execute the truncate command
# cursor.execute('DELETE FROM workflows')
#why does not below query work? please correct it for me

# cursor.execute('drop table workflows')
# cursor.execute('''CREATE TABLE IF NOT EXISTS workflows (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT,
#     canvas_data TEXT,
#     status TEXT,
#     created_at TIMESTAMP,
#     is_approved INTEGER,
#     user_id INTEGER
# );
# ''')
cursor.execute('select * from workflows')
print(cursor.fetchall())
# Commit the changes
conn.commit()

# Close the connection
conn.close()

# print("Workflow table truncated successfully.")