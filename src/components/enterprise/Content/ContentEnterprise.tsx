"use client"

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"
import LoopIcon from "@mui/icons-material/Loop"
import TuneIcon from "@mui/icons-material/Tune"
import { Button, TextField } from "@mui/material"
import Pagination from "@mui/material/Pagination"
import type React from "react"
import { useEffect, useState } from "react"
import NotfoundPage from "../../../global/NotfoundPage"
import Card from "../Card/Cards"
import Loader from "../../shared/Loaders/Loader"
import { FaMapMarkerAlt } from "react-icons/fa"
import "./Content.css"

// Define the interface for the component props
interface ContenidoProps {
  empresa: any[] // Replace 'any' with your actual empresa type
  loading: boolean
  dataLenght: number
  page: number
  setPage: (page: number) => void
  searchItem: string
  setSearchItem: (search: string) => void
  deleteDataFilter: () => void
  changeOrder: () => void
}

const Content: React.FC<ContenidoProps> = ({
  empresa,
  loading,
  dataLenght,
  page,
  setPage,
  searchItem,
  setSearchItem,
  deleteDataFilter,
  changeOrder,
}) => {
  const [location, setLocation] = useState({ lat: -34.397, lng: 150.644 }) // Valor por defecto
  const [municipio, setMunicipio] = useState("")
  const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined)

  const obtenerMunicipio = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDWmh4H4O1AqdP5-nzLJft-EdFo9m6TDk8`,
      )
      if (!response.ok) throw new Error("Error en la respuesta de la API")
      const data = await response.json()
      console.log(data)
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components
        const municipioComponent = addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_2"),
        )

        if (municipioComponent) {
          setMunicipio(municipioComponent.long_name)
        } else {
          setMunicipio("Municipio no encontrado")
        }
      } else {
        setMunicipio("No hay resultados")
      }
    } catch (error) {
      console.error("Error al obtener el municipio:", error)
      setMunicipio("Error al obtener municipio")
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })
          obtenerMunicipio(latitude, longitude)
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error)
          setMunicipio("No se pudo obtener ubicación")
        },
      )
    } else {
      console.error("La geolocalización no es soportada por este navegador.")
      setMunicipio("Geolocalización no soportada")
    }
  }, [])

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchItem(value); // Esto llama a la función del padre
  };

  const isWideScreen = window.innerWidth > 900

  return (
    <section className="contenidoTienda">
      <div className="locationcss">
        <FaMapMarkerAlt className="icon" />
        {isWideScreen && <h3>{municipio || "Cargando..."}</h3>}
      </div>

      <div className="content-wrapper">
        <div className="flex flex-col">
          <div>
            <h2 className="titulo-sala-compra-light text-2xl sm:text-3xl">Una gran variedad de emprendimientos</h2>
            <h4 className="sub-titulo-sala-compra-light text-lg sm:text-xl">
              Descubre emprendimientos con alto potencial
            </h4>
          </div>
          <p className="mt-4">
            Busca de manera dinámica los productos que más se adecuen a lo que necesitas, para ello se han dispuesto
            filtros en donde especificar un poco más lo que buscas.
          </p>
          <div className="flex align-center justify-evenly flex-wrap ajuste-wrap">
            <div
              className={
                isWideScreen
                  ? "flex flex-col sm:flex-row items-center justify-center gap-4 my-10"
                  : "flex flex-row mx-2 sm:flex-row items-center justify-center gap-2 my-8"
              }
            >
              <Button variant="contained" className="flex align-center boton_header" color="info" onClick={changeOrder}>
                <LoopIcon />
                {isWideScreen && <p>Orden ascendente</p>}
              </Button>
              <Button
                variant="contained"
                className="flex align-center boton_header"
                color="error"
                onClick={deleteDataFilter}
              >
                <DeleteSweepIcon />
                {isWideScreen && <p>Borrar filtros</p>}
              </Button>
            </div>
            <form action="" onSubmit={(e) => e.preventDefault()} className="flex-1 max-w-lg">
              <TextField
                fullWidth
                id="search"
                label="Buscar emprendimiento  ..."
                value={searchItem}
                onChange={handleSearchChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#39A900",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#39A900",
                  },
                }}
              />
            </form>
          </div>
        </div>

        {loading ? (
  <div className="flex justify-center items-center">
    <Loader />
  </div>
) : dataLenght > 0 ? (
  <>
    <div className="cards-container">
      {empresa.length > 0 && empresa.map((emp: any, index: number) => (
        <div key={index} className="card-wrapper">
          <Card empresa={emp} />
        </div>
      ))}
    </div>
    <div className="pagination-container">
      <Pagination
        count={Math.ceil(dataLenght / 20)}
        page={page}
        showFirstButton
        showLastButton
        onChange={handleChange}
      />
    </div>
  </>
) : (
  <NotfoundPage boton={true} />
)}
      </div>
    </section>
  )
}

export default Content