import './Home.scss'
const Home: React.FC = () =>
{
    const noImage = `${process.env.PUBLIC_URL}/background.png`;

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
        </>
    )

}
export default Home;