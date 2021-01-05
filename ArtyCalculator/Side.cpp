/*
#include <iostream>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <Windows.h>

//https://github.com/brutalchrist/ejemplosOpencv/blob/master/zoom.cpp

using namespace cv;
using namespace std;

string ExePath() {
	char buffer[MAX_PATH];
	GetModuleFileName(NULL, buffer, MAX_PATH);
	string::size_type pos = string(buffer).find_last_of("\\/");
	return string(buffer).substr(0, pos);
}


int main() {

	cout << "my directory is " << ExePath() << "\n";

	Mat img;

	img = imread("C:\\Users\\ThePapaBear\\Desktop\\opencv\\ArtyCalculator\\ArtyCalculator\\rose.jpg");

	if (!img.data)
	{
		cout << "sorry babe" << endl;
		return -1;
	}

	namedWindow("Artillery Calculator", WINDOW_NORMAL);

	imshow("Artillery Calculator", img);

	waitKey(0);

	system("PAUSE");

	return 0;
}
*/