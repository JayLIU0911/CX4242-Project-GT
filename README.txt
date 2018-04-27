DESCRIPTION:
	File:
		data_cleaning_google_dengue.ipynb:
			This jupyter notebook file converts Google Dengue data from csv file to json file.
		data_cleaning_google_flu.ipynb:
			This jupyter notebook file converts Google Flu data from csv file to json file.
		data_cleaning_kaggle:
			This jupyter notebook file converts Kaggle TB data from csv file to json file.
		date_mapping.ipynb:
			This jupyter notebook file constructs a mapping from year and week to their corresponding date for Google Dengue data and Google FLu data.
		index.html:
			The main html file for visualization.
		globe.js:
			The main javescript file which is referenced in index.html
		styles.css:
			The main css file which is referenced in index.html

	Folder:
		./data:
		It contains all the raw data and cleaned data we used for this project
		./lib:
		It contains all the javescript libraries we referenced in index.html
		./predict:
		It contains all the python scripts and results we got for the prediction part.


INSTALLATION:
	To run .ipynb file, you need to install jupyter notebook under python3 kernel.
	To run .py file in ./predict, you need to install python2 and corresponding packages like numpy, pandas, matplotlib, sklearn, etc.
	To run the main visualization tool, open index.html using Firefox.


EXECUTION:
	Step1: select the dataset from the selection list under Dataset section.
	Step2: select the attribute from the selection list under Attribute section.
	Step2: select the country from the selection list under Country section.
	Step3: spin the globe using mouse.
	Step4: click on the "Play" button to make the globe rotate automatically.
	Step5: click on the "Stop" button to stop rotation.
	Step6: click on the "Run Timeline" button such that the colors of countries will be updated according to the timeline.


			
