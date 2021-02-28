/*

#include <iostream>
#include <fstream>

using namespace std;

void getArrayFromFile() {

    float* myArray = new float[37748326]; //Abfragen bis zu 37748325

    char lel;

    bool startCollecting = false;

    string name = "";
    string fileNameOld = "altisHeightRE.B3D";

    string getting = "";

    ifstream Original(fileNameOld, ios::binary);

    int xValue = 0;
    int yName;

    int ArrayCounter = 0;

    if (Original.is_open()) {

        while (Original.get(lel) && ArrayCounter <= 37748325)
        {
            if (lel == ')')
            {
                startCollecting = false;
            }

            if (startCollecting == true)
            {

                if (lel == ',')
                {

                    std::string num = getting;
                    float temp = ::atof(num.c_str());

                    myArray[ArrayCounter] = temp;

                    ArrayCounter += 1;
                    getting = "";
                }

                if (lel != ',')
                {
                    getting = getting + lel;
                }

            }

            if (lel == '(')
            {
                startCollecting = true;

            }

        }

        Original.close();

    }

    cout << myArray[10] << endl;

    delete[] myArray;

    system("PAUSE");
}


int main()
{
    getArrayFromFile();
}



*/