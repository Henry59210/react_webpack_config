import React, {Suspense, lazy} from "react";
import { Link, Routes, Route } from "react-router-dom";

const Home = lazy(() => import(/*webpackChunkName: 'Home'*/"./pages/Home")) //这里的注释可以给打包后的该文件命名
const About = lazy(() => import(/*webpackChunkName: 'About'*/"./pages/About"))

export function App() {
    return (
        <div>
            <h1>App</h1>
            <ul>
                <li>
                    <Link to="/home">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
            </ul>
            {/*
            把Routes的地方替换成element
            懒加载，webpack里的splitChunks:true可以让其动态导入的单独打包，这样只有在点击home的时候该组件才会引入
            */}
            <Suspense fallback={<div>loading...</div>}>
                <Routes>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                </Routes>
            </Suspense>
        </div>
    )
}

export default App
