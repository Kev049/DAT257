import xarray as xr
import numpy as np

def main():

    data = xr.open_dataset('flask_app\wind-speed\ERA5-windspeed-final.nc')
    df = data.to_dataframe()
    df = df.reset_index()

    df = df.drop(df[(df.longitude % 2 != 0) | (df.latitude % 2 != 0)].index)
    df = df.reset_index(drop=True)

    df['wind_speed'] = np.sqrt(df['u10']**2 + df['v10']**2)
    df = df.drop(['time', 'u10', 'v10'], axis=1)
    df = df.groupby(['longitude', 'latitude']).mean().reset_index()

    df = df.dropna()

    #df.loc[(df['longitude'] == 0.0) & (df['latitude'] == 90.0)]
    df.to_csv('flask_app\wind-speed\windspeed-land-highres.csv', index=False)  
    
if __name__ == '__main__':
    main()