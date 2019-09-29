import React, { useEffect, useRef, useState } from 'react';
import fakeData from './data';
import { Suit } from './Suit';
import { IBarTool } from './ScrollBar/useScroll';
import ScrollBar from './ScrollBar';
export default ({ data, }) => {
  let barTool: IBarTool;

  // data = data || fakeData;
  // console.log(data);
  const canvas1 = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  const canvasline = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // const [playStatus, setPlayStatus] = useState(false);
  const [suit, setSuit] = useState(null as Suit);
  useEffect(() => {

    const rect = box.current.getBoundingClientRect();
    const { width, height } = rect;
    const instance = new Suit(
      canvas1.current,
      canvas2.current,
      canvasline.current,
      width,
      height,
      barTool
    );
    setSuit(instance);
    instance.onStatusChange = status => {
      console.log(status);
      // setPlayStatus(status);
    };

  }, []);
  data && suit && suit.init(data)
  return (
    <div style={{ width: '100%', height: '100%' }} ref={box}>
      <div
        ref={box}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <canvas ref={canvas1} width="1500" height="430">
          <p>Your browserdoes not support the canvas element.</p>
        </canvas>
        <canvas
          style={{ position: 'absolute', left: '0', top: '0' }}
          ref={canvasline}
          width="1500"
          height="430"
        >
          <p>Your browserdoes not support the canvas element.</p>
        </canvas>
        <canvas
          style={{ position: 'absolute', left: '0', top: '0' }}
          ref={canvas2}
          width="1500"
          height="430"
          // onMouseDown={e => {
          //   suit && suit.p.OnMouseDown(e.nativeEvent);
          // }}
          // onMouseMove={e => {
          //   suit && suit.p.OnMouseMove(e.nativeEvent);
          // }}
          // onMouseUp={e => {
          //   suit && suit.p.OnMouseUp(e.nativeEvent);
          // }}
        >
          <p>Your browserdoes not support the canvas element.</p>
        </canvas>
      </div>

      <ScrollBar
        box={box}
        getBarTool={tool => {
          barTool = tool;
        }}
      />
    </div>
  );
};
