export interface ImportedItem {
  id: string;
  link?: string;
  title?: string;
  subtitle?: string;
  shortDesc?: string;
  image?: string;
  width?: number;
  height?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  isNumbered?: boolean;
  subSections?: Section[];
}

export interface RelatedArticle {
  title: string;
  subtitle: string;
  link: string;
  image?: string;
}

export interface ArticleType {
  title: string;
  category: Category;
  date: string;
  content: string;
  related: RelatedArticle[];
  sections: Section[];
  imports: ImportedItem[];
  image?: string;
  author?: string;
  timeToRead?: string;
  shortDescription?: string;
}
