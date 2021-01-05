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





x = 0;
y = 16710;
hello = "";
c = 0;

while {y >= 0} do {

    while {c < 6} do {

        hello = hello + "B" + str (y) + "(";

        while {x <= 30720} do {

            hello = hello + str(abs(getTerrainHeightASL[x, y])) + ",";
            x = x + 5;

        };

        hello = hello + ")";

        y = y - 5;
        x = 0;
        c = c + 1;
    };

    copyToClipboard hello;

    hello = "";
    c = 0;

 };





string GetClipboardText()
{
    // Try opening the clipboard
    if (!OpenClipboard(nullptr)) {

    }

    // Get handle of clipboard object for ANSI text
    HANDLE hData = GetClipboardData(CF_TEXT);

    // Lock the handle to get the actual text pointer
    char* pszText = static_cast<char*>(GlobalLock(hData));

    // Save text in a string class instance
    std::string text(pszText);

    // Release the lock
    GlobalUnlock(hData);

    // Release the clipboard
    CloseClipboard();

    return text;
}

void doWork(int irritation) {

    string fileName = to_string(irritation) + ".B3D";
    ofstream CopyTo(fileName, ios::binary);

    if (CopyTo.is_open())
    {
        CopyTo << GetClipboardText();
        CopyTo.close();
    }

    irritation += 1;

    Sleep(7000);

    doWork(irritation);

}

int main(int argc, char** argv)
{

    doWork(571);

    return 0;
}

*/