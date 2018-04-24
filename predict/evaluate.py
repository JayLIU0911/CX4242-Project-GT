import numpy as np
import pandas as pd
import matplotlib.pylab as plt

import model
flu_countries = [ "Argentina","Australia","Austria","Belgium","Bolivia","Brazil","Bulgaria","Canada","Chile","France","Germany","Hungary","Japan","Mexico","Netherlands","New Zealand","Norway","Paraguay","Peru","Poland","Romania","Russia","South Africa","Spain","Sweden","Switzerland","Ukraine","United States","Uruguay" ]

flu_pred_start_week = 660

dengue_countries = [ 'Argentina','Bolivia','Brazil','India','Indonesia','Mexico','Philippines','Singapore','Thailand','Venezuela' ]

dengue_pred_start_week = 658

tuber_countries = [ 'Canada', 'Sao Tome and Principe', 'Turkmenistan', 'United States of America', 'United Republic of Tanzania', 'Lithuania', 'Cambodia', 'Ethiopia', 'Swaziland', 'Argentina', 'Cameroon', 'Burkina Faso', 'Ghana', 'Saudi Arabia', 'Slovenia', 'Guatemala', 'Bosnia and Herzegovina', 'Kuwait', 'Russian Federation', 'Jordan', 'Dominica', 'Liberia', 'Maldives', 'Pakistan', 'Oman', 'Cabo Verde', 'Seychelles', 'Gabon', 'Niue', 'Monaco', 'New Zealand', 'Yemen', 'Jamaica', 'Albania', 'Samoa', 'United Arab Emirates', 'India', 'Azerbaijan', 'Lesotho', 'Saint Vincent and the Grenadines', 'Kenya', 'Tajikistan', 'Turkey', 'Afghanistan', 'Bangladesh', 'Mauritania', 'Iran (Islamic Republic of)', 'Viet Nam', 'Saint Lucia', 'San Marino', 'Mongolia', 'France', 'Syrian Arab Republic', 'Rwanda', 'Slovakia', 'Somalia', 'Peru', 'Vanuatu', 'Nauru', 'Norway', "Cote d'Ivoire", 'Cook Islands', 'Benin', 'Cuba', 'Montenegro', 'Saint Kitts and Nevis', 'Togo', 'China', 'Armenia', 'Republic of Korea', 'Dominican Republic', 'Bolivia (Plurinational State of)', 'Ukraine', 'Bahrain', 'Tonga', 'Finland', 'Libya', 'Indonesia', 'Central African Republic', 'Mauritius', 'Sweden', 'Belarus', 'Mali', 'Bulgaria', 'Romania', 'Angola', 'Chad', 'South Africa', 'Cyprus', 'Brunei Darussalam', 'Qatar', 'Malaysia', 'Austria', 'Mozambique', 'Uganda', 'Hungary', 'Niger', 'Brazil', 'The former Yugoslav republic of Macedonia', 'Guinea', 'Panama', 'Guyana', 'Republic of Moldova', 'Costa Rica', 'Luxembourg', 'Bahamas', 'Ireland', 'Palau', 'Nigeria', 'Ecuador', 'Czech Republic', 'Australia', 'Algeria', 'El Salvador', 'Tuvalu', 'Solomon Islands', 'Marshall Islands', 'Chile', 'Belgium', 'Kiribati', 'Haiti', 'Iraq', 'Sierra Leone', 'Georgia', "Lao People's Democratic Republic", 'Gambia', 'Philippines', 'Morocco', 'Croatia', 'Guinea-Bissau', 'Thailand', 'Switzerland', 'Grenada', 'Venezuela (Bolivarian Republic of)', 'Belize', 'Portugal', 'Estonia', 'Uruguay', 'Mexico', 'Lebanon', 'Uzbekistan', 'Tunisia', 'Djibouti', 'Antigua and Barbuda', 'Spain', 'Colombia', 'Burundi', 'Fiji', 'Barbados', 'Madagascar', 'Italy', 'Bhutan', 'Sudan', 'Serbia', 'Nepal', 'Malta', 'Democratic Republic of the Congo', 'Netherlands', 'Suriname', 'United Kingdom of Great Britain and Northern Ireland', 'Micronesia (Federated States of)', 'Israel', 'Iceland', 'Zambia', 'Senegal', 'Papua New Guinea', 'Malawi', 'Trinidad and Tobago', 'Zimbabwe', 'Germany', 'Denmark', 'Kazakhstan', 'Poland', 'Eritrea', 'Kyrgyzstan', 'Andorra', 'Sri Lanka', 'Latvia', 'South Sudan', 'Japan', 'Honduras', 'Myanmar', 'Equatorial Guinea', 'Egypt', 'Nicaragua', 'Singapore', "Democratic People's Republic of Korea", 'Botswana', 'Timor-Leste', 'Congo', 'Greece', 'Paraguay', 'Namibia', 'Comoros' ]

tuber_attributes = [ 'Country','Year','Number of deaths due to tuberculosis','excluding HIV','Number of deaths due to tuberculosis','excluding HIV (Start range)','Number of deaths due to tuberculosis','excluding HIV (End range)','Number of prevalent tuberculosis cases','Number of prevalent tuberculosis cases (Start range)','Number of prevalent tuberculosis cases (End range)','Deaths due to tuberculosis among HIV-negative people (per 100000 population)','Deaths due to tuberculosis among HIV-negative people (per 100000 population) (Start range)','Deaths due to tuberculosis among HIV-negative people (per 100000 population) (End range)','Prevalence of tuberculosis (per 100000 population)','Prevalence of tuberculosis (per 100000 population)(start range)','Prevalence of tuberculosis (per 100000 population)(end range)' ]

def main():
	# flu_cross_validate() # cross validate the flu data for all countries
	# flu_example() # demonstrate the model using the data of United States
	# flu_pred() # get the predicted flu values for all countries
	# dengue_cross_validate() # cross validate the dengue data for all countries
	dengue_example() # show a example of Argentina
	# dengue_pred() # get the predicted dengue values


def flu_cross_validate():
	data = pd.read_csv('flu.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))

	# ***** Get socres for all country ***** #
	open('result.txt', 'w').close() # clear all the results before
	nn_metrics = []
	knn_metrics = []
	svr_metrics = []
	lr_metrics = []

	# test_countries = [ "Argentina","Australia" ]
	for country in flu_countries:
		print('\n\n', country, ':')
		model.record_to_file('\n\n' + country + ':')
		df = data[['Week', country]]
		df = df[np.isfinite(df[country])] # remove empty rows
		df = df.rename(index=str, columns={country: "Now"})
		df = prepare(df)
		nn_metric, knn_metric, svr_metric, lr_metric = model.cross_validate_models(df)
		print('mae', 'mse', 'evs', 'r2')
		print(nn_metric)
		print(knn_metric)
		print(svr_metric)
		print(lr_metric)

		nn_metrics.append(nn_metric)
		knn_metrics.append(knn_metric)
		svr_metrics.append(svr_metric)
		lr_metrics.append(lr_metric)

	nn_eva = np.mean(nn_metrics, axis=0)
	knn_eva = np.mean(knn_metrics, axis=0)
	svr_eva = np.mean(svr_metrics, axis=0)
	lr_eva = np.mean(lr_metrics, axis=0)

	print('\n\nTotal:')
	print('mae', 'mse', 'evs', 'r2')
	print(nn_eva)
	print(knn_eva)
	print(svr_eva)
	print(lr_eva)

	model.record_to_file('\n\nTotal:\t')
	model.record_to_file('mae\t\tmse\t\tevs\t\tr2')
	model.record_to_file(np.array2string(nn_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(knn_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(svr_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(lr_eva, formatter={'float_kind':lambda x: "%.3f" % x}))

def flu_example():
	data = pd.read_csv('flu.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))

	# ***** Show one case ***** #
	df = data[['Week', 'United States']]
	df = df[np.isfinite(df['United States'])] # remove empty rows
	df = df.rename(index=str, columns={'United States': "Now"})

	# plot the data
	plt.figure()
	plt.title('United States Record')
	plt.xlabel("Weeks")
	plt.ylabel("Flu Influenza Activity")
	plt.plot(df['Now'].tolist())
	print('checkout the graph')
	plt.show()

	df = prepare(df)
	model.try_models(df)

def flu_pred():
	data = pd.read_csv('flu.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))
	pred(data, flu_countries, flu_pred_start_week)

def dengue_cross_validate():
	data = pd.read_csv('dengue.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))

	# ***** Get socres for all country ***** #
	open('result.txt', 'w').close() # clear all the results before
	nn_metrics = []
	knn_metrics = []
	svr_metrics = []
	lr_metrics = []

	# test_countries = [ "Argentina","Australia" ]
	for country in dengue_countries:
		print('\n\n', country, ':')
		model.record_to_file('\n\n' + country + ':')
		df = data[['Week', country]]
		df = df[np.isfinite(df[country])] # remove empty rows
		df = df.rename(index=str, columns={country: "Now"})
		df = prepare(df)
		nn_metric, knn_metric, svr_metric, lr_metric = model.cross_validate_models(df)
		print('mae', 'mse', 'evs', 'r2')
		print(nn_metric)
		print(knn_metric)
		print(svr_metric)
		print(lr_metric)

		nn_metrics.append(nn_metric)
		knn_metrics.append(knn_metric)
		svr_metrics.append(svr_metric)
		lr_metrics.append(lr_metric)

	nn_eva = np.mean(nn_metrics, axis=0)
	knn_eva = np.mean(knn_metrics, axis=0)
	svr_eva = np.mean(svr_metrics, axis=0)
	lr_eva = np.mean(lr_metrics, axis=0)

	print('\n\nTotal:')
	print('mae', 'mse', 'evs', 'r2')
	print(nn_eva)
	print(knn_eva)
	print(svr_eva)
	print(lr_eva)

	model.record_to_file('\n\nTotal:\t')
	model.record_to_file('mae\t\tmse\t\tevs\t\tr2')
	model.record_to_file(np.array2string(nn_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(knn_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(svr_eva, formatter={'float_kind':lambda x: "%.3f" % x}))
	model.record_to_file(np.array2string(lr_eva, formatter={'float_kind':lambda x: "%.3f" % x}))

def dengue_example():
	data = pd.read_csv('dengue.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))

	# ***** Show one case ***** #
	df = data[['Week', 'Argentina']]
	df = df[np.isfinite(df['Argentina'])] # remove empty rows
	df = df.rename(index=str, columns={'Argentina': "Now"})

	# plot the data
	plt.figure()
	plt.title('Argentina Record')
	plt.xlabel("Weeks")
	plt.ylabel("Dengue Activity")
	print('checkout the graph')
	plt.plot(df['Now'].tolist())
	plt.show()

	df = prepare(df)
	model.try_models(df)

def dengue_pred():
	data = pd.read_csv('dengue.csv')
	data.insert(0, 'Week', range(1, 1 + len(data)))
	pred(data, dengue_countries, dengue_pred_start_week)

def pred(data, countries, start):
	# ***** Get predictions for all country *****#
	open('predictions.txt', 'w').close()
	for country in countries:
		record_predictions('\n' + country + ':')
		print('\n', country, ':')
		df = data[['Week', country]]
		df = df[np.isfinite(df[country])] # remove empty rows
		df = df.rename(index=str, columns={country: "Now"})

		for i in range(3):
			df_ = df.copy()
			df_ = prepare(df_, pred=True)
			# train the model using all data except for the latest record
			X = df_.iloc[:,:-1]
			y = df_.iloc[:,-1]
			X,y = model.preprocess_data(X,y)
			X_train, y_train = X[:-1], y[:-1]
			# printX_train, '\n', y_train
			lr, label = model.lr(X_train,y_train)
			model.evaluate(lr,X,y,X_train,X_train,y_train,y_train,label,graph=False)

			fea = X[-1]
			y_pred = lr.predict([fea])
			print('features:', fea, '\npredictions:', y_pred[0])
			record_predictions(str(y_pred[0]))

			rec = pd.DataFrame([[start+i, y_pred[0]]], columns=['Week','Now'])
			# print'\nbefore appending\n', df
			df = df.append(rec)
			# print'\nafter appending\n', df

def prepare(df,pred=False): # if pred, leave the last record for prediction
	# df.set_index('Date').diff()
	# change all the information to log scale
	# df['Now'] = np.log(df['Now'])

	df['1wb'] = df['Now'].shift(1)
	df['1wbd'] = df['Now'] - df['Now'].shift(1)
	df['2wb'] = df['Now'].shift(2)
	df['2wbd'] = df['Now'] - df['Now'].shift(2)
	df['3wb'] = df['Now'].shift(3)
	df['3wbd'] = df['Now'] - df['Now'].shift(3)
	df['4wb'] = df['Now'].shift(4)
	df['4wbd'] = df['Now'] - df['Now'].shift(4)
	df['4wb'] = df['Now'].shift(4)
	df['4wbd'] = df['Now'] - df['Now'].shift(4)
	df['5wb'] = df['Now'].shift(5)
	df['5wbd'] = df['Now'] - df['Now'].shift(5)
	if not pred:
		df['target'] = df['Now'].shift(-1)
		df = df.dropna()
	else:
		df = df.dropna()
		df['target'] = df['Now'].shift(-1)

	return df

def record_predictions(line):
	with open('predictions.txt', 'a') as fhand:
		fhand.write(line+'\n')

def get_tuber_countries():
	dic = {}
	with open('tuber.csv', 'r') as file:
		for line in file:
			if line.startswith('Country'):
				print(line)
				continue
			country = line[:line.index(',')]
			# printcountry
			if country in dic:
				dic[country] += 1
			else:
				dic[country] = 1

	print(dic)

def tuber():
	data = pd.read_csv('tuber.csv')
	country = 'Canada'
	attr = 'excluding HIV (Start range)'
	df = data.loc[data['Country'] == country][['Year', attr]]
	df = df.rename(index=str, columns={attr: "Now"})
	df = df.sort_index(axis=1 ,ascending=True)

if __name__ == "__main__":
	main()