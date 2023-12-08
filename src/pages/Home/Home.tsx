import './Home.scss'

const Home: React.FC = () =>
{
    return (
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
    )

}
export default Home;