
#include "opencv2/video/tracking.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/highgui/highgui.hpp"

#include <iostream>
#include <stdio.h>
#include <Windows.h>
#include <fstream>

#include <math.h> 
#include <stdio.h> 

using namespace cv;
using namespace std;

#define NEWZOOMLEVEL 10
#define GRAVITY 9.80665
#define PI 3.14159265
#define CONSOLE true
#define WINDOWSIZE 1200
#define WIDTHIMG 18432
#define ZOOMLEVEL 15
#define HEIHTMAPRES 6145
#define NUMBERTARGETS 4

//Gloabl Variables
float arty[3] = { 0,0,0 };
float* myArray = new float[37761025]; //Abfragen bis zu 37748325

int lvl = 0;
int width = WIDTHIMG;
int height = WIDTHIMG;
int centerX = WIDTHIMG / 2;
int centerY = WIDTHIMG / 2;
int NEWZoomSteps = 1793;


bool shutdownBool = false;

Scalar colorScheme[4] = { Scalar(41,30,53), Scalar(120,162,247), Scalar(160,233,200), Scalar(206,211,109) };

Mat imagenOriginal, imagen, testPicture, collision, collisionOriginal, menu, menuOriginal;

float positionToArrayFormat(int x, int y) {

	int temp = (x / 3) + (((y - 1) / 3) * HEIHTMAPRES);
	float position = myArray[temp];

	return position;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ROUND
// -------------------------------------------------------------------------------------------------------------
//	Round to 2 digits after the comma. (3 for Direction)
// -------------------------------------------------------------------------------------------------------------
// interation = i
// inputString = ele[3]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
string roundFunc(int interation, string inputString) {

	string cut = "";
	int x = 0;
	bool startCount = false;
	bool stop = false;

	while (stop == false)
	{
		if (startCount == true)
		{
			if (interation < 2)
			{
				cut = cut + inputString[x] + inputString[(x + 1)];

				cut = "Ele: " + cut;
			}
			else
			{
				cut = cut + inputString[x] + inputString[(x + 1)];

				cut = "Dir: " + cut;
			}

			stop = true;
		}

		if (inputString[x] == '.')
		{
			startCount = true;
		}

		if (stop == false)
		{
			cut = cut + inputString[x];
			x += 1;
		}
	}
	return cut;
}

void displayMenu() {

	imshow("Menu", menu);

	int width = 200;
	int gap = 20;

	string note = "";

	for (int i = 0; i < 4; i++)
	{

		switch (i)
		{
		case 0: {
			note = "Elevation";
			break;
		}
		case 1: {
			note = "Direction";
			break;
		}
		case 2: {
			note = "Firemode";
			break;
		}
		default:
			break;
		}

		rectangle(menu, Point(gap * (i + 1) + i * width, gap), Point(gap * (i + 1) + (i + 1) * width, gap + 50), colorScheme[3], FILLED, 8, 0);

		const char* c = note.c_str();
		putText(menu, c, Point((gap * (i + 1) + i * width) + 10, gap + 30), FONT_HERSHEY_SIMPLEX, 1, colorScheme[1], 2, 8);
	}


}

class targetClass {
public:
	float positionClass[3] = { 0,0,0 };
	float positionUpscaled[3] = { 0, 0,0 };

	float elevationClass[2] = { 0,0 };
	float directionClass = 0;

	float velocity = 0;

	float distance = 0;
	float distanceXY[2] = { 0,0 };

	float heightDifference = 0;

	float artyUpScale[3] = {0,0,0};

	string firemodeClass = "";

	Scalar color = colorScheme[0];

	bool active = false;
	bool activated = false;

	bool show[2] = { true, false};

	void activeChecker() {

		if (active == true)
		{
			color = colorScheme[0];
		}
		else
		{
			color = colorScheme[3];
		}

	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// COLLISION DETECTION
	// -------------------------------------------------------------------------------------------------------------
	//	Draw 2D Heightmap & Detect if there is a collision
	// -------------------------------------------------------------------------------------------------------------
	// distance = distance
	// elevationlow = elevation[0]
	// velocity = velocity
	// a = targetUpScale[0]
	// b = artyUpScale[0]
	// c = targetUpScale[1]
	// d = artyUpScale[1]
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	void CollisionDetectorFunc() {

		int stepsDistance = floor(distance / 100);
		int stepsWindow = (640 / stepsDistance);
		int beginning[2] = { 0, (640 - (int)positionToArrayFormat(artyUpScale[0] * 0.6, positionUpscaled[1] * 0.6)) };
		int ending[2] = { 0,0 };
		int offset = (int)positionToArrayFormat(artyUpScale[0] * 0.6, positionUpscaled[1] * 0.6);
		int heigthStore = 640 - offset;

		float angleMap = atan(distanceXY[1] / distanceXY[0]) * -1; //radians
		float angle = (elevationClass[0] * PI) / 180;
		float tempPointX;
		float tempPointY;
		float opposite;
		float adjecant;
		float heightPoint;

		for (int i = 100; i <= distance + 100; i = i + 100)
		{

			heightPoint = (640 - (tan(angle) * i - (GRAVITY / (2 * pow(velocity, 2.0) * pow(cos(angle), 2.0))) * pow(i, 2.0))) - offset;

			opposite = abs(i * sin(angleMap));
			adjecant = abs(i * cos(angleMap));

			if (distanceXY[0] > 0)
			{
				tempPointX = adjecant + artyUpScale[0];
			}
			else
			{
				tempPointX = artyUpScale[0] - adjecant;
			}

			if (distanceXY[1] > 0)
			{
				tempPointY = opposite + artyUpScale[1];
			}
			else
			{
				tempPointY = artyUpScale[1] - opposite;
			}

			ending[0] = i / 100 * stepsWindow;
			ending[1] = 640 - (int)positionToArrayFormat(tempPointX * 0.6, tempPointY * 0.6);

			cv::line(collision, Point(beginning[0], beginning[1]), Point(ending[0], ending[1]), colorScheme[1], 5, 8, 0);
			cv::line(collision, Point(beginning[0], heigthStore), Point(ending[0], (int)heightPoint), colorScheme[2], 5, 8, 0);

			beginning[0] = ending[0];
			beginning[1] = ending[1];
			heigthStore = (int)heightPoint;

		}

		imshow("Collision", collision);

	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// CHOOSE FIREMODE
	// -------------------------------------------------------------------------------------------------------------
	//	Chose firemode of Artillery Tank. Because these firemodes have different initial velocities.
	// -------------------------------------------------------------------------------------------------------------
	// a = distance
	// b = velocity
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	void FireModeFunc() {

		if (distance >= 826 && distance <= 2237)
		{
			firemodeClass = "Close";
			velocity = 810 * 0.19;
		}

		if (distance > 2237 && distance <= 5646)
		{
			firemodeClass = "Medium";
			velocity = 810 * 0.3;
		}

		if (distance > 5646 && distance <= 15029)
		{
			firemodeClass = "Far";
			velocity = 810 * 0.48;
		}

		if (distance > 15029 && distance <= 42818)
		{
			firemodeClass = "Further";
			velocity = 810 * 0.8;
		}

		if (velocity == 0)
		{
			firemodeClass = "Error";
			cout << "Too Close - Shooting is not possible" << endl;
		}

	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// CALCULATE DIRECTION
	// -------------------------------------------------------------------------------------------------------------
	//	Calculate the direction for the Turrent 
	// -------------------------------------------------------------------------------------------------------------
	// a = targetUpScale[0]
	// b = artyUpScale[0]
	// c = targetUpScale[1]
	// d = artyUpScale[1]
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	void DirectionFunc() {

		if (distanceXY[0] >= 0 && (distanceXY[1] * -1) >= 0)
		{
			//Rechtes Quadrat Oben
			directionClass = (abs(atan(distanceXY[0] / (distanceXY[1] * -1))) * 180.0 / PI); //Korrekt
		}

		if (distanceXY[0] <= 0 && (distanceXY[1] * -1) >= 0)
		{
			directionClass = 270 + (abs(atan((distanceXY[1] * -1) / distanceXY[0])) * 180.0 / PI); //Korrekt
			//Linkes Quadrat Oben
		}

		if (distanceXY[0] >= 0 && (distanceXY[1] * -1) <= 0)
		{
			directionClass = 90 + (abs(atan((distanceXY[1] * -1) / distanceXY[0])) * 180.0 / PI); //Korrekt
			//Rechtes Quadrat Unten
		}

		if (distanceXY[0] <= 0 && (distanceXY[1] * -1) <= 0)
		{
			directionClass = 180 + (abs(atan(distanceXY[0] / (distanceXY[1] * -1))) * 180.0 / PI);
			//Links Quadrat Unten
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// CALCULATE THE BALLISTIC PATH - CORE FUNCTION
	// -------------------------------------------------------------------------------------------------------------
	//	Calculates the ballistic path of the shells and calls various functions. (One of the Core Functions)
	// -------------------------------------------------------------------------------------------------------------
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	void BallisticPath() {

		artyUpScale[0] = arty[0] / 0.6;
		artyUpScale[1] = arty[1] / 0.6;
		artyUpScale[2] = arty[2];

		positionUpscaled[0] = positionClass[0] / 0.6;
		positionUpscaled[1] = positionClass[1] / 0.6;
		positionUpscaled[2] = positionClass[2];

		distanceXY[0] = positionUpscaled[0] - artyUpScale[0];
		distanceXY[1] = positionUpscaled[1] - artyUpScale[1];

		distance = sqrt(pow(distanceXY[0], 2.0) + pow(distanceXY[1], 2.0));

		heightDifference = positionUpscaled[2] - artyUpScale[2];

		FireModeFunc();
		DirectionFunc();

		elevationClass[0] = (atan((pow(velocity, 2.0) - sqrt(pow(velocity, 4.0) - (GRAVITY * ((GRAVITY * pow(distance, 2.0)) + (2.0 * heightDifference * pow(velocity, 2.0)))))) / (GRAVITY * distance))) * 180 / PI;
		elevationClass[1] = (atan((pow(velocity, 2.0) + sqrt(pow(velocity, 4.0) - (GRAVITY * ((GRAVITY * pow(distance, 2.0)) + (2.0 * heightDifference * pow(velocity, 2.0)))))) / (GRAVITY * distance))) * 180 / PI;

		if (active == true)
		{
			CollisionDetectorFunc();
		}

		return;
	}

	void drawFunc() {

		if (positionClass[0] > centerX && positionClass[0] < (centerX + width) && positionClass[1] > centerY && positionClass[1] < (centerY + height))
		{

			activeChecker();

			float disX = positionClass[0] - centerX;
			float disY = positionClass[1] - centerY;

			float ratio = (float)WIDTHIMG / (float)width;

			disX = disX * ratio;
			disY = disY * ratio;

			circle(imagen, Point(disX, disY), 100, color, 150, 8, 0);

			string ele[3];

			positionClass[2] = positionToArrayFormat(positionClass[0], positionClass[1]);

			BallisticPath();

			displayMenu();

			ele[0] = to_string(roundf(elevationClass[0] * 100) / 100);
			ele[1] = to_string(roundf(elevationClass[1] * 100) / 100);
			ele[2] = to_string(roundf(directionClass * 100) / 100);

			for (int i = 0; i < 3; i++)
			{

				string cut = roundFunc(i, ele[i]);

				if (i == 0)
				{
					disY = disY - 250;
					disX = disX + 400;
				}

				if (i == 0 && show[0] == true)
				{
					const char* c = cut.c_str();
					putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 30, color, 80, 8);
				}

				if (i == 1 && show[0] == false)
				{
					const char* c = cut.c_str();
					putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 30, color, 80, 8);
				}

				if (i == 2 && show[1] == true)
				{
					disY = disY + 1000;
					const char* c = cut.c_str();
					putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 30, color, 80, 8);
				}

			}

			if (show[1] == false)
			{
				disY = disY + 1000;
				const char* c = firemodeClass.c_str();
				putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 30, color, 80, 8);
			}
			
		}
	}
};

targetClass target[NUMBERTARGETS];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BANNER "ARES"
// -------------------------------------------------------------------------------------------------------------
//	Display the ARES Banner and add some description
// -------------------------------------------------------------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void Cookie_Monster_Banner() {
	std::cout << R"(   
__________________________________________________________________________________
_____/\\\\\\\\\_______/\\\\\\\\\______/\\\\\\\\\\\\\\\_____/\\\\\\\\\\\___________     
____/\\\\\\\\\\\\\___/\\\///////\\\___\/\\\///////////____/\\\/////////\\\________
____/\\\/////////\\\_\/\\\_____\/\\\___\/\\\______________\//\\\______\///________
____\/\\\_______\/\\\_\/\\\\\\\\\\\/____\/\\\\\\\\\\\_______\////\\\______________
_____\/\\\\\\\\\\\\\\\_\/\\\//////\\\____\/\\\///////___________\////\\\__________
______\/\\\/////////\\\_\/\\\____\//\\\___\/\\\_____________________\////\\\______
_______\/\\\_______\/\\\_\/\\\_____\//\\\__\/\\\______________/\\\______\//\\\____
________\/\\\_______\/\\\_\/\\\______\//\\\_\/\\\\\\\\\\\\\\\_\///\\\\\\\\\\\/____
_________\///________\///__\///________\///__\///////////////____\///////////_____  
__________________________________________________________________________________    

Made by BE3dARt with <3! (https://github.com/BE3dARt / https://be3dart.ch/) 
Add me on Steam! (https://steamcommunity.com/id/thepapabear/)
Join my group: "11th Artillery Battalion [11AB]" on Arma 3 Units! (https://units.arma3.com/unit/11thartillerybattalion)

Using this program is very simple! You'll add the location of the artillery unit by clicking the right mouse button. By clicking the left mouse button you will choose your target position. Elevation and direction is then calculated and you are ready to shoot! Use your mouse wheel to zoom in and out. Close the program by hitting 'ESC' while on the map.)";
}

void progressBar(int irritation) {

	string add = "";

	if (irritation == 0)
	{ 
		add = add + '[';

		for (int i = 0; i < 100; i++)
		{
			add = add + '-';
		}

		add = add + ']';

		cout << add;

		return;
	}
	else
	{
		for (int i = 0; i < 102; i++)
		{
			cout << '\b';
			cout << '\b';
		}

		add = '[';

		for (int i = 1; i <= irritation; i++)
		{
			add = add + '#';
		}

		for (irritation; irritation <= 100; irritation++)
		{
			add = add + '-';
		}

		add = add + ']';

		cout << add;

		return;
	}

	return;

}

void getArrayFromFile() {

	int steps = 377610;
	int progressCounter = 0;
	int irritationCounter = 1;

	progressBar(0);

	char lel;

	bool startCollecting = false;

	string name = "";
	string fileNameOld = "Source/HeightMap.B3D";

	string getting = "";

	ifstream Original(fileNameOld, ios::binary);

	int xValue = 0;
	int yName;

	int ArrayCounter = 0;

	int TestCounter = 0;

	if (Original.is_open()) {

		while (Original.get(lel) && ArrayCounter <= 37761024)
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


					if (progressCounter == steps)
					{
						progressCounter = 0;
						irritationCounter += 1;
						progressBar(irritationCounter);
						
					}

					progressCounter += 1;
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


			if (lel == 'B')
			{
				TestCounter += 1;
			}

		}

		Original.close();

	}
}

Mat ZoomInBE(int x, int y) {

	if (lvl >= 0 && lvl <= NEWZOOMLEVEL)
	{
		//cout << " width: " << width << " height: " << height << " x: " << x << " y: " << y << endl;

		if (lvl > 1)
		{
			x = (x * width / WIDTHIMG) + centerX;
			y = (y * height / WIDTHIMG) + centerY;
		}

		//cout << x << endl;

		//Define Window Size
		width = WIDTHIMG - NEWZoomSteps * lvl;
		height = WIDTHIMG - NEWZoomSteps * lvl;

		//cout << width << endl;

		//Define Window Beginning
		centerX = x - (WIDTHIMG - NEWZoomSteps * lvl) / 2;
		centerY = y - (WIDTHIMG - NEWZoomSteps * lvl) / 2;

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

		imagen_roi.copyTo(testPicture);

		return imagen_roi;
	}

	if (lvl < 0)
	{
		lvl = 0;
		return imagenOriginal;
	}

	if (lvl > NEWZOOMLEVEL)
	{
		lvl = NEWZOOMLEVEL;
		return ZoomInBE(x, y);
	}

}

void drawCircleGeneral(float middleX, float middleY, Scalar color) {


	if (middleX > centerX && middleX < (centerX + width) && middleY > centerY && middleY < (centerY + height))
	{
		float disX = middleX - centerX;
		float disY = middleY - centerY;

		float ratio = (float)WIDTHIMG / (float)width;

		disX = disX * ratio;
		disY = disY * ratio;

		circle(imagen, Point(disX, disY), 100, color, 150, 8, 0);

		arty[2] = positionToArrayFormat(arty[0], arty[1]);

		string displayText = "Artillery";
		const char* c = displayText.c_str();

		disY = disY + 250;
		disX = disX + 400;

		putText(imagen, c, Point(disX, disY), FONT_HERSHEY_SIMPLEX, 30, color, 80, 8);
	
	}
}


static void menuMouse(int event, int x, int y, int flags, void* /*param*/)
{
	if (event == EVENT_MOUSEWHEEL || event == EVENT_LBUTTONDOWN || event == EVENT_RBUTTONDOWN)
	{
		testPicture.copyTo(imagen);
		collisionOriginal.copyTo(collision);
	}

	if (event == EVENT_LBUTTONDOWN)
	{
		int width = 200;
		int gap = 20;

		if (x >= gap && x <= gap + width && y >= gap && y <= gap + 50)
		{
			for (int i = 0; i < NUMBERTARGETS; i++)
			{
				if (target[i].show[0] == true)
				{
					target[i].show[0] = false;
				}
				else
				{
					target[i].show[0] = true;
				}
			}
			
			cout << "yeee" << endl;
		}

		if (x >= 2 * gap + width && x <= 2 * gap + 2 * width && y >= gap && y <= gap + 50)
		{
			for (int i = 0; i < NUMBERTARGETS; i++)
			{
				if (target[i].show[1] == true)
				{
					target[i].show[1] = false;
				}
				else
				{
					target[i].show[1] = true;
				}
			}

			cout << "buoy" << endl;
		}

		if (x >= 3 * gap + 2 * width && x <= 3 * gap + 3 * width && y >= gap && y <= gap + 50)
		{
			cout << "ducking hell" << endl;
			shutdownBool = true;
		}

		for (int i = 0; i < NUMBERTARGETS; i++)
		{
			cout << "okay" << endl;
			target[i].drawFunc();
		}

	}

	if (event == EVENT_MOUSEWHEEL || event == EVENT_LBUTTONDOWN || event == EVENT_RBUTTONDOWN)
	{
		if (lvl > 1)
		{
			drawCircleGeneral(arty[0], arty[1], colorScheme[1]); //red
		}

		imshow("Artillery Calculator - ARES", imagen);
	}

}


static void onMouse(int event, int x, int y, int flags, void* /*param*/)
{

	if (event == EVENT_MOUSEWHEEL || event == EVENT_LBUTTONDOWN || event == EVENT_RBUTTONDOWN)
	{
		testPicture.copyTo(imagen);
		collisionOriginal.copyTo(collision);
	}

	if (event == EVENT_MOUSEWHEEL) {
		if (getMouseWheelDelta(flags) > 0) {
			lvl = lvl + 1;
			
			imagen = ZoomInBE(x, y);
		}
		else {
			lvl = lvl - 1;
			imagen = ZoomInBE(x, y);
		}

	}

	if (event == EVENT_LBUTTONDOWN)
	{
		if (lvl > 1)
		{
			for (int i = 0; i < NUMBERTARGETS; i++)
			{
				if (target[i].activated == false)
				{
					target[i].active = true;
					target[i].activated = true;

					cout << i << endl;

					target[i].positionClass[0] = (x * width / WIDTHIMG) + centerX;
					target[i].positionClass[1] = (y * height / WIDTHIMG) + centerY;

					if (i != 0)
					{
						target[i-1].active = false;
					}
					
				}
				else
				{
					if (target[i].active == true)
					{
						target[i].positionClass[0] = (x * width / WIDTHIMG) + centerX;
						target[i].positionClass[1] = (y * height / WIDTHIMG) + centerY;
					}
				}
			}
		}
	}

	if (event == EVENT_RBUTTONDOWN)
	{
		if (lvl > 1)
		{
			arty[0] = (x * width / WIDTHIMG) + centerX;
			arty[1] = (y * height / WIDTHIMG) + centerY;
		}
	}

	if (event == EVENT_MOUSEWHEEL || event == EVENT_LBUTTONDOWN || event == EVENT_RBUTTONDOWN)
	{
		if (lvl > 1)
		{
			for (int i = 0; i < NUMBERTARGETS; i++)
			{
				if (target[i].activated == true)
				{
					target[i].drawFunc();
				}
			}
			drawCircleGeneral(arty[0], arty[1], colorScheme[1]); //red
		}

		imshow("Artillery Calculator - ARES", imagen);
	}
}

void argh() {

	testPicture.copyTo(imagen);
	collisionOriginal.copyTo(collision);

	for (int i = 0; i < NUMBERTARGETS; i++)
	{
		if (target[i].active == true)
		{
			target[i].active = false;

			int temp = i - 1;

			if (temp < 0)
			{
				temp = NUMBERTARGETS-1;
			}

			target[temp].active = true;

			i = NUMBERTARGETS + 1;

		}
	}

	for (int i = 0; i < NUMBERTARGETS; i++)
	{
		target[i].drawFunc();
		cout << "Ending: " << target[i].active << endl;
	}

	drawCircleGeneral(arty[0], arty[1], colorScheme[1]); //red
	imshow("Artillery Calculator - ARES", imagen);
}

int main(int argc, char** argv)
{
	Cookie_Monster_Banner();

	cout << "\n\nLoading Height Data into RAM ..." << endl;

	getArrayFromFile();

	cout << "\n\nImporting Map ..." << endl;

	//Import Picture
	imagenOriginal = imread("Source/ContourMap.jpg");
	collision = Mat(640, 640, CV_8UC3, cv::Scalar(0, 0, 0));
	menu = Mat(680, 680, CV_8UC3, cv::Scalar(0, 0, 0));

	//Error Handeling
	if (imagenOriginal.empty())
		cout << "Picture not Found\n" << endl;

	cout << "Creating Window ..." << endl;

	//Create Window
	namedWindow("Artillery Calculator - ARES", WINDOW_NORMAL);
	namedWindow("Collision", WINDOW_NORMAL);
	namedWindow("Menu", WINDOW_NORMAL);

	//Rezize Window
	resizeWindow("Artillery Calculator - ARES", WINDOWSIZE, WINDOWSIZE);
	resizeWindow("Collision", 640, 640);
	resizeWindow("Menu", 680, 680);

	cout << "Initializing Map ..." << endl;

	if (!CONSOLE)
	{
		HWND hwnd = GetConsoleWindow();
		ShowWindow(hwnd, 0);
	}

	//Set mouse Callback
	setMouseCallback("Artillery Calculator - ARES", onMouse, 0);
	setMouseCallback("Menu", menuMouse, 0);

	//Fill other Matrixes with Original Image
	imagenOriginal.copyTo(imagen);
	imagenOriginal.copyTo(testPicture);
	collision.copyTo(collisionOriginal);
	menu.copyTo(menuOriginal);

	while (shutdownBool == false)
	{
		char c = (char)waitKey(10);

		switch (c)
		{
		case 'r': {
			argh();

		}

		default:
			break;
		}
	}

	delete[] myArray;
	return 0;

}