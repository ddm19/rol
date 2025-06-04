import { ArticleType } from "components/Article/types";

export interface FormDataArticle {
  title?: string;
  date?: string;
  content?: string;
  image?: string;
  author?: string;
  timeToRead?: string;
  shortDescription?: string;
  related?: Array<{ values?: RelatedFormValues }>;
  imports?: Array<{ values?: ImportFormValues }>;
}

interface RelatedFormValues {
  title?: string;
  subtitle?: string;
  link?: string;
  image?: string;
}

interface ImportFormValues {
  id?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  shortDescription?: string;
  image?: string;
}

export function validateFormData(formData: FormDataArticle) {
  const missingFields = [];
  const missingOptionalFields = [];
  if (!formData.title || formData.title.trim() === "") {
    missingFields.push("Título general");
  }
  if (!formData.timeToRead || formData.timeToRead.trim() === "") {
    missingFields.push("Tiempo de lectura");
  }
  if (!formData.author || formData.author.trim() === "") {
    missingFields.push("Autor");
  }
  if (!formData.date || formData.date.trim() === "") {
    missingFields.push("Fecha");
  }
  if (!formData.shortDescription || formData.shortDescription.trim() === "") {
    missingFields.push("Descripción corta");
  }
  if (!Array.isArray(formData.imports) || formData.imports.length < 0) {
    missingOptionalFields.push("No se han añadido importados (Opcional)");
  } else {
    formData.imports.forEach((item, index: number) => {
      const vals = item.values || {};
      if (!vals.id || vals.id.trim() === "") {
        missingFields.push(`Importado ${index + 1}: Identificador`);
      }
      if (!vals.title || vals.title.trim() === "") {
        missingFields.push(`Importado ${index + 1}: Título`);
      }
      if (!vals.subtitle || vals.subtitle.trim() === "") {
        missingFields.push(`Importado ${index + 1}: Subtítulo`);
      }
    });
  }
  if (!Array.isArray(formData.related) || formData.related.length < 0) {
    missingOptionalFields.push("No se han añadido relacionados (Opcional)");
  } else {
    formData.related.forEach((item, index: number) => {
      const vals = item.values || {};
      if (!vals.title || vals.title.trim() === "") {
        missingFields.push(`Relacionado ${index + 1}: Título`);
      }
      if (!vals.subtitle || vals.subtitle.trim() === "") {
        missingFields.push(`Relacionado ${index + 1}: Subtítulo`);
      }
      if (!vals.link || vals.link.trim() === "") {
        missingFields.push(`Relacionado ${index + 1}: Enlace`);
      }
    });
  }
  if (missingFields.length > 0 || missingOptionalFields.length > 0) {
    alert(
      "Faltan los siguientes campos por rellenar:\n" +
        missingFields.join("\n") +
        "\n\n" +
        missingOptionalFields.join("\n"),
    );
  } else {
    alert("Todos los campos obligatorios han sido rellenados.");
  }
  return missingFields.length === 0;
}

export function generateArticleJSON(formData: FormDataArticle): ArticleType {
  const ensureHttps = (url?: string): string => {
    if (!url) return "";
    if (!url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  return {
    title: formData.title || "",
    date: formData.date || "",
    content: formData.content || "",
    image: formData.image || "",
    author: formData.author || "",
    timeToRead: formData.timeToRead || "",
    shortDescription: formData.shortDescription || "",
    related: Array.isArray(formData.related)
      ? formData.related.map((item) => ({
          title: item.values?.title || "",
          subtitle: item.values?.subtitle || "",
          link: ensureHttps(item.values?.link),
          image: item.values?.image || "",
        }))
      : [],
    imports: Array.isArray(formData.imports)
      ? formData.imports.map((item) => ({
          id: item.values?.id || "",
          link: ensureHttps(item.values?.link),
          title: item.values?.title || "",
          subtitle: item.values?.subtitle || "",
          shortDesc: item.values?.shortDescription || "",
          image: item.values?.image || "",
        }))
      : [],
    sections: [],
  };
}
