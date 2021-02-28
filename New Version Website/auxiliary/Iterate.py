file = open('HeightMap.B3D', 'r')

array = []

arrayCounter = 0
startCollecting = 0

temp = ""

#37761024
while arrayCounter < 37761025: 
      
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

print(array[19813060])

s = input('--> ')  
