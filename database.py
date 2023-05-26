
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
cursor.execute('DELETE FROM workflows')

# Commit the changes
conn.commit()

# Close the connection
conn.close()

print("Workflow table truncated successfully.")
