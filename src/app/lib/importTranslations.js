import axios from "axios";
import { API_URL } from "@/app/constants";
import { getTokenFromBrowser } from "@/store/constants";

export async function uploadTranslationsCSV(file) {
  const form = new FormData();
  form.append("file", file);

  const token = getTokenFromBrowser();

  const res = await axios.post(
    `${API_URL}/translations/bulk`,
    form,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      timeout: 600000,
    }
  );

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Bulk import failed");
  }

  return res.data;
}
