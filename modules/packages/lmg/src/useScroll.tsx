import { useRef, useEffect } from 'react';

// window.onload = function() {
//   mouseScroll(function(delta) {
//     var obj = $('scroll'),
//       current = parseInt(obj.offsetTop) + delta * 10;
//     obj.style.top = current + 'px';
//   });
// };
type TResolve = (value: number) => void;
export interface ICb {
  then: (fn: TResolve) => void;
}
function useScroll(): [React.MutableRefObject<any>, React.MutableRefObject<any>, () => ICb] {
  const bar = useRef<HTMLElement>(null);
  const box = useRef<HTMLElement>(null);
  let resolve: TResolve = () => {};

  useEffect(() => {
    const barEl = bar.current;
    const boxEl = box.current;

    var boxRec = boxEl.getBoundingClientRect();
    const barRex = barEl.getBoundingClientRect();

    var { width: boxWidth } = boxRec;
    var { width: barWidth } = barRex;
    const wheelCb = function(e: any) {
      var delta = e.wheelDelta / 120;
      setOffset(
        bar.current,
        delta * 30 + parseInt(bar.current.style.left) || 0,
        boxWidth,
        barWidth,
        resolve
      );
    };
    const mousedownCb = e => {
      var boxRec = boxEl.getBoundingClientRect();
      const barRex = barEl.getBoundingClientRect();
      var { left: boxLeft } = boxRec;
      var { left: barLeft } = barRex;
      var { x } = getCoordInDocument(e);

      const span = x - barLeft;
      document.onmousemove = function(e) {
        var { x } = getCoordInDocument(e);
        let offsetLeft = x - (boxLeft + span);
        setOffset(barEl, offsetLeft, boxWidth, barWidth, resolve);
      };

      document.onmouseup = function() {
        //移除鼠标移动事件
        document.onmousemove = null;
      };
    };
    boxEl.addEventListener('wheel', wheelCb);
    barEl.addEventListener('mousedown', mousedownCb);

    return () => {
      boxEl.removeEventListener('wheel', wheelCb);
      barEl.removeEventListener('mousedown', mousedownCb);
    };
  }, []);
  const g = (): ICb => {
    return {
      then(fn) {
        resolve = fn;
      },
    };
  };
  return [bar as any, box as any, g];
}
function getCoordInDocument(e: MouseEvent) {
  e = (e as any) || window.event;
  var x = e.pageX || e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
  var y = e.pageY || e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
  return { x: x, y: y };
}

function setOffset(bar: HTMLElement, offset: number, boxWidth: number, barWidth: number, resolve) {
  const distance = boxWidth - barWidth;
  const result = offset <= 0 ? 0 : offset >= distance ? distance : offset;
  bar.style.left = result + 'px';
  resolve(result);
}

export default useScroll;