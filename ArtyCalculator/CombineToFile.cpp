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

    string fileName = "NEWAltisHeight.B3D";
    ofstream CopyTo(fileName, ios::binary);
    char lel;
    int counter = 1;

    while (counter <= 1026)
    {

        string fileNameOld = "Height (" + to_string(counter) + ").B3D";

        ifstream Original(fileNameOld, ios::binary);

        counter += 1;

        if (Original.is_open()) {

            while (Original.get(lel))
            {
                CopyTo.put(lel);
            }

            Original.close();

        }

    }

    CopyTo.close();

    system("PAUSE");
}


int main(int argc, char** argv)
{

    writeToFile();

    return 0;
}



*/