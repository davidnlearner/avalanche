import { useRef, useEffect, useState } from "react";

import { initGame } from "./game.js";
import Footer from "./components/Footer";
import Header from "./components/Header.js";
import Instructions from "./components/Instructions.js";

function App() {
    const gameWindow = useRef(null);

    const [height, setHeight] = useState(800);
    const [width, setWidth] = useState(800);
    // eslint-disable-next-line no-unused-vars
    const [game, setGame] = useState(null);

    useEffect(() => {
        setGame(initGame({ gameWindow, height, width }));

        window.addEventListener("resize", () => {
            setHeight(window.innerHeight);
            setWidth(window.innerWidth);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="App">
            <Header />
            <div className="game-wrapper">
                <canvas ref={gameWindow} className="game-window"></canvas>
            </div>
            <Instructions />
            <hr />
            <Footer />
        </div>
    );
}

export default App;
