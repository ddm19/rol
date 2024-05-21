import { Link } from "react-router-dom";

/*<div className='article'>
                    <img src={noImage} alt="article1" />
                    <h3 className='articleTitle'>Este es un post</h3>
                    <p className='articleInfo'>Dani Domenech •  Mar 15, 2022  •  leído en 10 min</p>
                    <p className='articleDescription'>Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...</p>
                </div>*/
interface ArticleDisplayProps
{
    image: string,
    title: string,
    articleInfo: string,
    description: string,
    articleId: number;
}
const ArticleDisplay = (props: ArticleDisplayProps) =>
{
    const { image, title, articleInfo, description, articleId } = props;

    return (
        <Link className='article' to={`article/${articleId}`}>
            <img src={image} alt="article1" />
            <h3 className='articleTitle'>{title}</h3>
            <p className='articleInfo'>{articleInfo}</p>
            <p className='articleDescription'>{description}</p>
        </Link>
    );
};

export default ArticleDisplay;