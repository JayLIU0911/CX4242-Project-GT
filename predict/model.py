import sys
import numpy as np
import pandas as pd
import random
import matplotlib.pyplot as plt		# For plotting the data

##### Preprocessing #####
from sklearn.preprocessing import StandardScaler

##### Model Selection #####

## Cross Validation ##
from sklearn.model_selection import ShuffleSplit
# from sklearn.cross_validation import train_test_split

## Models ##
from sklearn.neural_network import MLPClassifier, MLPRegressor	# For Neural Network
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor	# For K Nereast Neighbor
from sklearn.svm import SVC, NuSVC, LinearSVC, SVR	# For Support Vector Machine
from sklearn.linear_model import LinearRegression	# For Linear Regression

## Plots ##
from sklearn.model_selection import learning_curve

## Model Evaluation ##
from sklearn.metrics import accuracy_score
from sklearn.model_selection import cross_val_score

# Regression #
from sklearn.metrics import explained_variance_score
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_squared_log_error
from sklearn.metrics import r2_score

Random_State = 5
# TITLE = "Learning Curve (Neural Network)"
ARCHI = (100,)
N_NEI = 10

def try_models(df):
	X = df.iloc[:,:-1]
	y = df.iloc[:,-1]
	X,y = preprocess_data(X,y)

	X_train,X_test,y_train,y_test = split_tran_test(X,y)
	model, label = nn(X_train,y_train)
	evaluate(model,X,y,X_train,X_test,y_train,y_test,label,graph=True)
	model, label = knn(X_train,y_train)
	evaluate(model,X,y,X_train,X_test,y_train,y_test,label,graph=True)
	model, label = svr(X_train,y_train)
	evaluate(model,X,y,X_train,X_test,y_train,y_test,label,graph=True)
	model, label = lr(X_train,y_train)
	evaluate(model,X,y,X_train,X_test,y_train,y_test,label,graph=True)

def cross_validate_models(df):
	X = df.iloc[:,:-1]
	y = df.iloc[:,-1]
	X,y = preprocess_data(X,y)
	return cross_validate(X,y)

def cross_validate(X,y):
	nn_scores = []
	knn_scores = []
	svr_scores = []
	lr_scores = []
	for portion in range(Random_State):
		X_train,X_test,y_train,y_test = split_tran_test(X,y,portion)

		model, label = nn(X_train,y_train)
		nn_scores.append( evaluate(model,X,y,X_train,X_test,y_train,y_test,label) )

		model, label = knn(X_train,y_train)
		knn_scores.append( evaluate(model,X,y,X_train,X_test,y_train,y_test,label) )

		model, label = svr(X_train,y_train)
		svr_scores.append( evaluate(model,X,y,X_train,X_test,y_train,y_test,label) )

		model, label = lr(X_train,y_train)
		lr_scores.append( evaluate(model,X,y,X_train,X_test,y_train,y_test,label) )

	nn_metric = np.mean(nn_scores, axis=0)
	knn_metric = np.mean(knn_scores, axis=0)
	svr_metric = np.mean(svr_scores, axis=0)
	lr_metric = np.mean(lr_scores, axis=0)

	# print'mae', 'mse', 'evs', 'r2'
	# printnn_metric
	# printknn_metric
	# printsvr_metric
	# printlr_metric

	record_to_file('mae\t\tmse\t\tevs\t\tr2')
	record_to_file(np.array2string(nn_metric, formatter={'float_kind':lambda x: "%.3f" % x}))
	record_to_file(np.array2string(knn_metric, formatter={'float_kind':lambda x: "%.3f" % x}))
	record_to_file(np.array2string(svr_metric, formatter={'float_kind':lambda x: "%.3f" % x}))
	record_to_file(np.array2string(lr_metric, formatter={'float_kind':lambda x: "%.3f" % x}))

	return nn_metric, knn_metric, svr_metric, lr_metric

def record_to_file(line):
	with open('result.txt', 'a') as fhand:
		fhand.write(line+'\n')

def preprocess_data(X,y):
	scaler = StandardScaler().fit(X)
	return scaler.transform(X), y

def split_tran_test(X,y,portion=None):
	# X_train,X_test,y_train,y_test = train_test_split(X,y, random_state=Random_State)

	# Only a continuous portion of the data is assigned to be tested on
	length = len(X)
	if not portion:
		portion = random.randint(0,Random_State-1)
	start = int(length*portion/Random_State)
	end = int(length*(portion+1)/Random_State)
	try:
		X_test = X[start:end]
		y_test = y[start:end]
	except:
		print('error', start, end)

	X1 = X[:start]
	X2 = X[end:]
	y1 = y[:start]
	y2 = y[end:]
	X_train = np.concatenate((X1,X2),axis=0)
	y_train = np.concatenate((y1,y2),axis=0)

	return X_train,X_test,y_train,y_test

def evaluate(model,X,y,X_train,X_test,y_train,y_test,label,graph=False):
	ypred = model.predict(X_test)
	ytrue = y_test

	mae = mean_absolute_error(ytrue, ypred)
	mse = mean_squared_error(ytrue, ypred)
	# msle = mean_squared_log_error(ytrue, ypred)
	evs = explained_variance_score(ytrue, ypred)
	r2 = r2_score(ytrue, ypred)

	if graph:
		print(label)
		print("Mean Absolute Error:\t", mae)
		print("Mean Squared Error:\t", mse)
		print("Explained Variance Score:\t", evs)
		print("R2 Score:\t", r2)
		plot_curve(ytrue,ypred,label)

	return [mae, mse, evs, r2]

def nn(X_train,y_train):
	# model = MLPClassifier(activation='relu', alpha=1e-05, batch_size='auto',beta_1=0.9, beta_2=0.999, early_stopping=False,epsilon=1e-08, hidden_layer_sizes=ARCHI, learning_rate='constant',learning_rate_init=0.02, max_iter=200, momentum=0.9,nesterovs_momentum=True, power_t=0.5, random_state=1, shuffle=True,solver='lbfgs', tol=0.0001, validation_fraction=0.1, verbose=False,warm_start=False)
	model = MLPRegressor(hidden_layer_sizes=ARCHI, activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, power_t=0.5, max_iter=5000, shuffle=True, random_state=None, tol=0.0001, verbose=False, warm_start=False, momentum=0.9, nesterovs_momentum=True, early_stopping=False, validation_fraction=0.1, beta_1=0.9, beta_2=0.999, epsilon=1e-08)
	model.fit(X_train,y_train)
	label = "Neural Net-L=0.02,L" + str(ARCHI)
	return model,label

def knn(X_train,y_train):
	# model = KNeighborsClassifier(n_neighbors=N_NEI)
	model = KNeighborsRegressor(n_neighbors=N_NEI, weights='distance', algorithm='auto', leaf_size=30, p=2, metric='minkowski', metric_params=None, n_jobs=1)
	model.fit(X_train,y_train)
	label = "KNN-Neighbors " + str(N_NEI)
	return model,label

def svr(X_train,y_train):
	model = SVR(kernel='rbf', degree=3, gamma='auto', coef0=0.0, tol=0.001, C=1.0, epsilon=0.1, shrinking=True, cache_size=200, verbose=False, max_iter=10000)
	model.fit(X_train,y_train)
	label = "SVM Regression"
	return model,label

def lr(X_train,y_train):
	model = LinearRegression(fit_intercept=True, normalize=False, copy_X=True, n_jobs=1)
	model.fit(X_train,y_train)
	label = "Linear Regression"
	return model,label


def svm(X_train,y_train):
	model = LinearSVC(multi_class = 'ovr')
	model.fit(X_train,y_train)
	label = "SVM"
	return model,label

def plot_curve(tar,pred,label):
	plt.figure()
	plt.title(label)

	plt.xlabel("Weeks")
	plt.ylabel("Flu Influenza Activity")
	# x values
	x_values = np.arange(1,tar.shape[0]+1,1)
	# plt.xticks(np.arange(1,tar.shape[0]+1, 5.0))
	# plt.xticks(rotation=70)

	plt.plot(x_values, tar, '--', color="r", label="Real Value")
	plt.plot(x_values, pred, '--', color="b", label="Predicted Value")

	plt.legend(loc="best")
	print("Check out the graph popped up")
	plt.show()

def plot_against(tar,pred,label):
	plt.figure()
	plt.title(label)

	plt.xlabel("Targets")
	plt.ylabel("Predictions")
	plt.plot(tar,pred, '-o', color="b")

	print("Check out the graph popped up")
	plt.show()

def preprocess_feature(X_train,X_test):
	# Preprocess the Features
	scaler = StandardScaler().fit(X_train)
	X_train = scaler.transform(X_train)	# Rescale the data
	X_test = scaler.transform(X_test)
	return X_train,X_test

def score_model(model,X,y):
	cv_scores = cross_val_score(model,X,y,cv=Random_State)
	print("Cross Validation Scores:")
	print(cv_scores)

def fit_model(model,X_train,y_train,X_test,y_test):
	print("Training size:\t")
	print(X_train.shape[0])
	model.fit(X_train,y_train)
	# accu = accuracy_score(y_test,model.predict(X_test))
	# print"Accuracy: \t", accu

	return model

def learn_cur(model, title, X, y, label=None, ylim=None, cv=None, n_jobs=1, train_sizes=np.linspace(.1, 1.0, 10)):
								# ylim : tuple, shape (ymin, ymax), optional. Defines minimum and maximum yvalues plotted.

	# Cross validation with 100 iterations to get smoother mean test and train
	# score curves, each time with 20% data randomly selected as a validation set.
	cv = ShuffleSplit(n_splits=10, test_size=0.2, random_state=0)

	plt.figure()
	plt.title(title + label)
	if ylim is not None:
		plt.ylim(*ylim)
	plt.xlabel("Training examples ")
	plt.ylabel("Score")
	train_sizes, train_scores, test_scores = learning_curve(
		model, X, y, cv=cv, n_jobs=n_jobs, train_sizes=train_sizes)
	train_scores_mean = np.mean(train_scores, axis=1)
	train_scores_std = np.std(train_scores, axis=1)
	test_scores_mean = np.mean(test_scores, axis=1)
	test_scores_std = np.std(test_scores, axis=1)
	plt.grid()

	plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
					 train_scores_mean + train_scores_std, alpha=0.1,
					 color="r")
	plt.fill_between(train_sizes, test_scores_mean - test_scores_std,
					 test_scores_mean + test_scores_std, alpha=0.1, color="g")
	plt.plot(train_sizes, train_scores_mean, 'o-', color="r",
			 label="Training score")
	plt.plot(train_sizes, test_scores_mean, 'o-', color="g",
			 label="Cross-validation score")

	plt.legend(loc="best")

	return plt

if __name__ == '__main__':
	# df = data_loader.load_data(sys.argv[1]) # argv[1] is the file storing the dataset
	# neural_network(df)
	print("model.py not for direct usage")