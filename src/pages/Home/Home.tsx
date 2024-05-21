import { FormEventHandler, useEffect } from 'react';
import './Home.scss';
import './animations.css';
import { Link } from 'react-router-dom';
import ArticleDisplay from 'components/ArticleDisplay/articleDisplay';

const Home: React.FC = () =>
{
    const noImage = `${process.env.PUBLIC_URL}/background.png`;


    const submitEmail = (e: any): FormEventHandler<HTMLButtonElement> | any =>
    {
        e.preventDefault();
        alert("Método de envío de Emails no implementado!");

    };


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
                <ArticleDisplay image={noImage} title={'Este es un post'} articleInfo={'Dani Domenech •  Mar 15, 2022  •  leído en 10 min'} description={'Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...'} articleId={1} />
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