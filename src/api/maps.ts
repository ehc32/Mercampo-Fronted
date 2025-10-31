import { authAxios } from "./useAxios"

export const get_google_maps_config = async () => {
  const res = await authAxios.get("users/google-maps/config/")
  return res.data as { api_key: string | null; has_config?: boolean }
}

export const save_google_maps_config = async (api_key: string) => {
  const res = await authAxios.post("users/google-maps/config/save/", { api_key })
  return res.data
}


