import xarray as xr
import numpy as np

def generateDataFrame(dataset):
    data = xr.open_dataset(dataset)
    df = data.to_dataframe()
    df = df.reset_index()
    return df

def reduceDataPoints(df):
    df = df.drop(df[(df.longitude % 2 != 0) | (df.latitude % 2 != 0)].index)
    df = df.reset_index(drop=True)
    return df

def calculate_wind_speed(df):
    df['wind_speed'] = np.sqrt(df['u10']**2 + df['v10']**2)
    df = df.drop(['time', 'u10', 'v10'], axis=1)
    df = df.groupby(['longitude', 'latitude']).mean().reset_index()
    df = df.dropna()
    return df

def produceCSV(df):
    df.to_csv('flask_app\wind-speed\windspeed-land-highres3.csv', index=False)

def main():
    dataset = 'flask_app\wind-speed\ERA5-windspeed-final.nc'
    dataframe = generateDataFrame(dataset)
    dataframe = reduceDataPoints(dataframe)
    dataframe = calculate_wind_speed(dataframe)
    produceCSV(dataframe)
    
if __name__ == '__main__':
    main()