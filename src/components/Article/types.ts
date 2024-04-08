export interface ImportedItem 
{
    id: string;
    link?: string;
    title?: string;
    subtitle?: string;
    shortDesc?: string;
    image?: string;
}
export interface Section
{
    id: number;
    title: string;
    subtitle?: string;
    content: string;
    isNumbered?: boolean;
    subSections?: Section[];
}

export interface RelatedArticle
{
    title: string;
    subtitle: string;
    link: string;
    image?: string;
}

export interface ArticleType
{
    title: string;
    date: string;
    content: string;
    related: RelatedArticle[];
    sections: Section[];
    imports: ImportedItem[];
}