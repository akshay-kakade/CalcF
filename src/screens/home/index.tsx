    import { useEffect, useRef, useState } from "react";
    import { SWITCHES } from '@/constants';
    import {  ColorSwatch, Group } from "@mantine/core";
    import axios from 'axios';
    import '@/App.css';
    import { Button } from "@/components/ui/button";
    import Draggable from "react-draggable";



interface GeneratedResult {
    expression: string;
    answer: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState<GeneratedResult>();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
            }

        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
            });
        };

        return () => {
            document.head.removeChild(script);
        };

    }, []);


    const renderLatexToCanvas = (expression: string, answer: string) => {
        //const latex = `\\(\\LARGE{${expression} = ${answer}}\\n)`;
        const latex = `$$${expression} = ${answer}$$\n`;
        setLatexExpression([...latexExpression, latex]);

    
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

console.log(latexPosition);
    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };
    const stopDrawing = () => {
        setIsDrawing(false);
    };

 


    const sendData = async () => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            console.log('Response', resp);
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    // dict_of_vars[resp.result] = resp.answer;
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    });
                }
            });
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 5;
                    if (imageData.data[i + 3] > 0) { 
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                }, 100);
            });
        }
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
     <p className="text-purple-700 w-full bg-inherit bg-gradient-to-r from-amber-400 via-pink-500 to-blue-500 hover:shadow-lg transition-shadow duration-300">
  <i className="text-white">How to Use the AI-Powered Calculator</i>
  <br />
  <span className="text-gray-700">
    Draw your math problem in the space provided below. Our AI will interpret your drawing and provide the solution.
  </span>
</p>

<div className="">
{latexExpression && (
  <Draggable>
    <div className="text-center align-text-top content-center items-center mr-100 mb-500 absolute p-2 text-white rounded shadow-md bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:shadow-lg transition-shadow duration-300">
      <div className="align-text-top text-lg font-semibold">{latexExpression.join('\n')}</div>
    </div>
  </Draggable>

)}
</div>     
 <canvas
                ref={canvasRef}
                id="canvas"
                className="border-1 border border-red-600 w-full h-full"
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
            />

            <div className="fixed ml-6 mr-6 bottom-0 left-0 right-0 flex flex-row flex-wrap items-center justify-center gap-2 mb-0  p-4 rounded-t-lg shadow-lg z-20  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:shadow-lg transition-shadow duration-300">
                <Group className="flex gap-2 flex-col">
                    {SWITCHES.map((swatchcolor: string) => (
                        <ColorSwatch
                            key={swatchcolor}
                            color={swatchcolor}
                            onClick={() => setColor(swatchcolor)}
                            className="cursor-pointer border-2 border-gray-300 rounded-full p-2"
                        />
                    ))}
                </Group>

                <Button
                    onClick={sendData}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md ml-8 gap-6 shadow-md transition duration-300"
                >
                    Calculate
                </Button>
                <Button
                    onClick={() => setReset(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300"
                >
                    Reset
                </Button>
            </div>

           
        </div>
    );
}
