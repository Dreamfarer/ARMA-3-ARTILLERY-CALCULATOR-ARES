import mysql.connector

#MYSQL
mydb = mysql.connector.connect(
  host="",
  user="",
  password=",
  database=""
)

mycursor = mydb.cursor()

mycursor.execute("CREATE TABLE heightmap (id INT AUTO_INCREMENT PRIMARY KEY, altitude INT)")

s = input('Job done, yee')  
