import { FormEventHandler, useEffect, useState } from 'react';
import './Home.scss';
import './animations.css';
import { Link } from 'react-router-dom';
import ArticleDisplay from 'components/ArticleDisplay/articleDisplay';
import { fetchArticles } from './actions';
import { ArticleDisplayType } from './types/types';
import { ArticleType } from 'components/Article/types';

const Home: React.FC = () =>
{
    const noImage = `${process.env.PUBLIC_URL}/background.png`;
    const [articles, setArticles] = useState<ArticleDisplayType[]>([]);

    const submitEmail = (e: any): FormEventHandler<HTMLButtonElement> | any =>
    {
        e.preventDefault();
        alert("Método de envío de Emails no implementado!");

    };
    useEffect(() =>
    {
        fetchArticles().then((res) =>
        {
            setArticles(res);
        }).catch((err) =>
        {
            console.log(err);
        });
    }, []);


    return (
        <>
            <div className='titleBlock'>
                <div className='articleBGContainer'>
                    <div className='mainArticleContainer'>
                        <h1 className="title whiteText">Hispania</h1>
                        <p className='normalText whiteText '>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate imperdiet aliquet.
                            Nulla laoreet vulputate libero vel malesuada. Integer non tellus diam. Pellentesque lorem mi.</p>
                        <button className='button redText normalText'>Leer Más</button>
                    </div>

                </div>

            </div>
            <div className='articlesContainer'>
                {articles.length > 0 &&
                    articles.map((articleItem: ArticleDisplayType, index: number) =>
                    {


                        return <ArticleDisplay key={index}
                            image={articleItem.content.image ? articleItem.content.image : noImage}
                            title={articleItem.content.title} articleInfo={getArticleInfo(articleItem.content)}
                            description={articleItem.content.shortDescription ? articleItem.content.shortDescription : ""}
                            articleId={articleItem.name} />;



                    })
                }
            </div>
            <div className='emailContainer'>
                <div className='titleContainer'>
                    <h1 className=' emailTitle'>
                        Entérate cuando haya algo nuevo
                    </h1>
                    <p className='emailDescription'>
                        Partidas, nuevo lore, personajes interesantes...
                    </p>

                    <p className='emailDescription'>
                        Haz que te llegue un mail cuando haya algo nuevo!
                    </p>

                </div>
                <form onSubmit={submitEmail} className='emailForm'>
                    <input className='redText' type="email" name="email" id="email" placeholder="Aquí va tu email"></input>
                    <button className='button whiteText subscribeButton' type="submit">Enviar</button>
                </form>
            </div>
        </>
    );

};
export default Home;
function getArticleInfo(content: ArticleType): string
{

    const timeToRead = content.timeToRead ? `Leído en ${content.timeToRead}` : "";
    const author = content.author ? content.author : "";

    return `${author} • ${content.date} • ${timeToRead} `;
}