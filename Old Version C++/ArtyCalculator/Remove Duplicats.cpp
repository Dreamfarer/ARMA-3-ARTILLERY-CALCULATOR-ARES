/*
#include <iostream>
#include <stdio.h>
#include <Windows.h>

#include <vector>
#include <stdexcept>
#include <fstream>
#include <memory>
#include <cstring>
#include <string>
#include <chrono>
#include <math.h>

using namespace std;

void writeToFile() {

    //string fileName = "altisHeight.B3D";
    //ofstream CopyTo(fileName, ios::binary);

    char lel;

    bool startName = false;
    bool startCollecting = false;

    string name = "";
    string predictedName = "";

    int irritation = 30720;
    int counter = 2;

    bool stop = false;

    while (irritation >= 0 && counter <= 1270)
    {
        stop = false;

        string fileNameOld = to_string(counter) + ".B3D";
        ifstream Original(fileNameOld, ios::binary);
        counter += 1;

        startName = false;
        startCollecting = false;
        name = "";
        predictedName = "";

        if (Original.is_open()) {

            while (Original.get(lel) && stop == false)
            {
                if (lel == ')')
                {
                    startName = false;
                    startCollecting = false;
                    name = "";
                    predictedName = "";
                }

                if (startCollecting == true)
                {
                    //
                }

                if (lel == '(')
                {
                    startName = false;
                    startCollecting = true;

                    predictedName = to_string(irritation);

                    if (name != predictedName)
                    {
                        std::cout << "Error at Irritation: " << irritation << ", File: " << fileNameOld << endl;
                        Original.close();
                        stop = true;
                        const char* c = fileNameOld.c_str();
                        const int result = remove(c);
                        //std::system("PAUSE");

                        //irritation = irritation - 30;
                    }
                    else
                    {
                        irritation = irritation - 5;
                    }

                }

                if (startName == true)
                {
                    name = name + lel;
                }


                if (lel == 'B')
                {
                    startName = true;
                }
            }

            Original.close();

        }
    }
}


int main(int argc, char** argv)
{

    writeToFile();

    return 0;
}


*/