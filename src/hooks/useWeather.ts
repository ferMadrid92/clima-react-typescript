import axios from 'axios'
import { z } from 'zod'
//import { object, string, number, Output, parse } from 'valibot'
import { SearchType } from '../types'
import { useMemo, useState } from 'react'

// Type Guard o Assertion
// function isWeatherResponse(weather : unknown) : weather is Weather {
//     return (
//       Boolean(weather) &&
//       typeof weather === 'object' &&
//       typeof (weather as Weather).name === 'string' &&
//       typeof(weather as Weather).main.temp === 'number' &&
//       typeof(weather as Weather).main.temp_max === 'number' &&
//       typeof(weather as Weather).main.temp_min === 'number'
//     )
// }

//Zod
const WeatherSchema = z.object({
  name: z.string(),
  main: z.object({
      temp: z.number(),
      temp_max: z.number(),
      temp_min: z.number()
  })
})
export type Weather = z.infer<typeof WeatherSchema>

//Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//       temp: number(),
//       temp_max: number(),
//       temp_min: number(),
//     })
// })
// export type Weather = Output<typeof WeatherSchema>

const initialState = {
    name: '',
    main: {
      temp: 0,
      temp_max: 0,
      temp_min: 0
    }
}

export default function useWeather() {

    const [weather, setWeather] = useState<Weather>(initialState)

    const [loading, setLoading] = useState(false)

    const [notFound, setNotFound] = useState(false)

    const fetchWeather = async(search: SearchType) => {
      const appId = import.meta.env.VITE_API_KEY
      setLoading(true)
      setWeather(initialState)
      try {      
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`

        const {data} = await axios(geoUrl)

        //comprobar si existe
        if(!data[0]) {
          setNotFound(true)
          return
        }

        const lat = data[0].lat
        const lon = data[0].lon

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`

        //Type Guards
        // const {data: weatherData} = await axios(weatherUrl)
        // const result = isWeatherResponse(weatherData)
        // if(result) {
        //   console.log(weatherData.name)
        // }

        // Zod
        const {data: weatherData} = await axios(weatherUrl)
        const result = WeatherSchema.safeParse(weatherData)
        if(result.success) {
          setWeather(result.data)
        }

        //Valibot
        // const {data: weatherData} = await axios(weatherUrl)
        // const result = parse(WeatherSchema, weatherData)
        // if(result) {
        //   console.log(result.name)
        // }

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    const hasWeatherData = useMemo(() => weather.name, [weather])

  return {
    weather,
    loading,
    notFound,
    fetchWeather,
    hasWeatherData
  }
}
