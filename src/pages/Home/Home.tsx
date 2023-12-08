import { FormEventHandler } from 'react';
import './Home.scss'
import './animations.css'

const Home: React.FC = () =>
{
    const noImage = `${process.env.PUBLIC_URL}/background.png`;

    const articles = [
        {
            title: "Título de post1",
            author: "Daniel Domenech",
            date: "15 Marzo 2022",
            timeToRead: "10 min",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing"
        }
    ]

    const submitEmail = (e: any): FormEventHandler<HTMLButtonElement> | any =>
    {
        e.preventDefault()
        console.log("Método de envío de Emails no implementado!")

    }

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
                <div className='article'>
                    <img src={noImage} alt="article1" />
                    <h3 className='articleTitle'>Este es un post</h3>
                    <p className='articleInfo'>Dani Domenech •  Mar 15, 2022  •  leído en 10 min</p>
                    <p className='articleDescription'>Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...</p>
                </div>
                <div className='article'>
                    <img src={noImage} alt="article1" />
                    <h3 className='articleTitle'>Este es un post</h3>
                    <p className='articleInfo'>Dani Domenech •  Mar 15, 2022  •  leído en 10 min</p>
                    <p className='articleDescription'>Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...</p>
                </div>
                <div className='article'>
                    <img src={noImage} alt="article1" />
                    <h3 className='articleTitle'>Este es un post</h3>
                    <p className='articleInfo'>Dani Domenech •  Mar 15, 2022  •  leído en 10 min</p>
                    <p className='articleDescription'>Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...</p>
                </div>
                <div className='article'>
                    <img src={noImage} alt="article1" />
                    <h3 className='articleTitle'>Este es un post</h3>
                    <p className='articleInfo'>Dani Domenech •  Mar 15, 2022  •  leído en 10 min</p>
                    <p className='articleDescription'>Suspendisse potenti. Sed neque augue, mattis in posuere quis, sagittis...</p>
                </div>
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
    )

}
export default Home;