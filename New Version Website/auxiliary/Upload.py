import mysql.connector

file = open('HeightMap.B3D', 'r')

array = []

arrayCounter = 0
startCollecting = 0

temp = ""

#37761024
magicNumber = 37761024

while arrayCounter <= magicNumber: 
      
    char = file.read(1)

    if char == ')':
        startCollecting = 0

    
    if startCollecting == 1:
        if char == ',':
        
            array.append(float(temp))
            temp = ""
            arrayCounter += 1
            
        else:
            temp += char
            
    if char == '(':
        startCollecting = 1

  
file.close()

print("Writing Arrays into memory is done!")

#MYSQL
mydb = mysql.connector.connect(
  host="",
  user="",
  password="",
  database=""
)

mycursor = mydb.cursor()
i = 0
ev = int(1)

cancel= 0

while cancel == 0:

    sql = "INSERT INTO heightmap (altitude) VALUES "

    #Split into 100k junks
    while i <= 100000 * ev:
        
        inserter = int(array[i] * 10000)

        if i == magicNumber:
            sql = sql + "(" + str(inserter) + ")"
            cancel = 1
            break

        if i < 100000*ev:
            sql = sql + "(" + str(inserter) + "), "

        if i == 100000*ev:
            sql = sql + "(" + str(inserter) + ")"

        i += 1


    mycursor.execute(sql)
    mydb.commit()
    
    message = "Process " + str(ev)
    print(message)

    ev += 1

print(i)
s = input('Job done, yee')  

