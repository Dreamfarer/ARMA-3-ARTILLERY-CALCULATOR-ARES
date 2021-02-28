/*
#include "opencv2/video/tracking.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/highgui/highgui.hpp"

#include <iostream>
#include <stdio.h>
#include <Windows.h>
#include <fstream>

using namespace cv;
using namespace std;

#define CONSOLE true
#define WINDOWSIZE 600

//#define WIDTHIMG 1000
#define WIDTHIMG 18432

#define ZOOMLEVEL 15
//#define ZOOMLEVEL 14

#define HEIHTMAPRES 6144

Mat imagenOriginal, imagen, imagenMostrar;

int mousex, mousey;

int mouseXBattery, mouseYBattery;

int lvl = 0;

int width = WIDTHIMG;
int height = WIDTHIMG;

int centerX = WIDTHIMG / 2;
int centerY = WIDTHIMG / 2;

int steps = WIDTHIMG / ZOOMLEVEL;

float* myArray = new float[37748326]; //Abfragen bis zu 37748325

float positionToArrayFormat(int x, int y) {

	int temp = (x / 3) + (y / 3) * HEIHTMAPRES;

	return myArray[temp];
}

void getArrayFromFile() {

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

					if (temp == (float)264.577)
					{
						cout << "FUCK @ " << ArrayCounter << endl;
					}

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
}

Mat ZoomInBE(int x, int y) {

	if (lvl >= 0 && lvl <= ZOOMLEVEL - 1)
	{
		//cout << " width: " << width << " height: " << height << " x: " << x << " y: " << y << endl;

		if (lvl > 1)
		{
			x = (x * width / WIDTHIMG) + centerX;
			y = (y * height / WIDTHIMG) + centerY;
		}

		//cout << x << endl;

		//Define Window Size
		width = WIDTHIMG - steps * lvl;
		height = WIDTHIMG - steps * lvl;

		//cout << width << endl;

		//Define Window Beginning
		centerX = x - (WIDTHIMG - steps * lvl) / 2;
		centerY = y - (WIDTHIMG - steps * lvl) / 2;

		if (centerX < 0)
		{
			centerX = 0;
		}

		if (centerY < 0)
		{
			centerY = 0;
		}

		if (centerX + width > WIDTHIMG)
		{
			centerX = WIDTHIMG - width;
		}

		if (centerY + height > WIDTHIMG)
		{
			centerY = WIDTHIMG - height;
		}

		//cout << " width: " << width << " height: " << height << " x: " << centerX << " y: " << centerY << "\n" << endl;

		//system("PAUSE");

		Rect roi = Rect(centerX, centerY, width, height);

		Mat imagen_roi = imagenOriginal(roi);

		resize(imagen_roi, imagen_roi, Size(imagenOriginal.size().width, imagenOriginal.size().height), 0, 0, INTER_AREA);

		return imagen_roi;
	}

	if (lvl < 0)
	{
		lvl = 0;
		return imagenOriginal;
	}

	if (lvl > ZOOMLEVEL - 1)
	{
		lvl = ZOOMLEVEL - 1;
		return ZoomInBE(x, y);
	}

}

void drawCircleGeneral(float middleX, float middleY, Scalar color) {


	if (middleX > centerX && middleX < (centerX + width) && middleY > centerY && middleY < (centerY + height))
	{
		//cout << " width: " << width << " height: " << height << " x: " << centerX << " y: " << centerY << "\n" << endl;

		float disX = middleX - centerX;
		float disY = middleY - centerY;

		float ratio = (float)WIDTHIMG / (float)width;

		disX = disX * ratio;
		disY = disY * ratio;

		circle(imagen, Point(disX, disY), 100, color, 150, 8, 0);

		cout << positionToArrayFormat(mousex, mousey) << "m @ x:" << mousex << ", y: " << mousey << endl;

		//std::string str = to_string(positionToArrayFormat(mousex, mousey));
		//const char* c = str.c_str();

		//putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 40, color, 80, 8);

	}

}

static void onMouse(int event, int x, int y, int flags, void* param)
{

	if (event == EVENT_MOUSEWHEEL) {
		if (getMouseWheelDelta(flags) > 0) {
			lvl = lvl + 1;

			imagen = ZoomInBE(x, y);
		}
		else {
			lvl = lvl - 1;
			imagen = ZoomInBE(x, y);
		}


		if (lvl > 1)
		{
			drawCircleGeneral(mousex, mousey, Scalar(255, 0, 0)); //vlue
			drawCircleGeneral(mouseXBattery, mouseYBattery, Scalar(0, 0, 255)); //red
		}


	}

	if (event == EVENT_LBUTTONDOWN)
	{
		if (lvl > 1)
		{

			mousex = (x * width / WIDTHIMG) + centerX;
			mousey = (y * height / WIDTHIMG) + centerY;

			drawCircleGeneral(mousex, mousey, Scalar(255, 0, 0));

		}
	}

	if (event == EVENT_RBUTTONDOWN)
	{
		if (lvl > 1)
		{

			mouseXBattery = (x * width / WIDTHIMG) + centerX;
			mouseYBattery = (y * height / WIDTHIMG) + centerY;

			drawCircleGeneral(mouseXBattery, mouseYBattery, Scalar(0, 0, 255));

		}
	}
}

int main(int argc, char** argv)
{
	getArrayFromFile();

	//2741/3 / 9182/3 * 6144

	cout << myArray[18912126] << endl;

	if (!CONSOLE)
	{
		HWND hwnd = GetConsoleWindow();
		ShowWindow(hwnd, 0);
	}

	//Import Picture
	imagenOriginal = imread(argv[1]);

	//Error Handeling
	if (imagenOriginal.empty())
		cout << "Picture not Found\n" << endl;

	//Create Window
	namedWindow("Zoom", WINDOW_NORMAL);

	//Rezize Window
	resizeWindow("Zoom", WINDOWSIZE, WINDOWSIZE);

	//Set mouse Callback
	setMouseCallback("Zoom", onMouse, 0);

	//Fill other Matrixes with Original Image
	imagenOriginal.copyTo(imagen);
	imagenOriginal.copyTo(imagenMostrar);

	for (;;)
	{
		if (imagen.empty())
			break;

		imagen.copyTo(imagenMostrar);

		imshow("Zoom", imagenMostrar);

		char c = (char)waitKey(10);

		if (c == 27)
			break;

		
		switch (c)
		{
		case '+':
				zoomRec = zoomRec + 10;
			break;
		case '-':
				zoomRec = zoomRec - 10;
			break;
		default:
			;
		}
		


	}

	delete[] myArray;

	return 0;
}
*/