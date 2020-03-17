import React, { useState, useRef, FunctionComponent } from 'react';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from 'antd';
import { Suit } from '@lianmed/lmg/lib/Ctg/Suit';


const Bar: FunctionComponent<{ mutableSuit: React.MutableRefObject<Suit> }> = function (props) {
  const [showBar, setShowBar] = useState(false)
  const { mutableSuit } = props



  const timeout = useRef(null)






  const autoHide = () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setShowBar(false)
    }, 15000);
  };
  const toggleTool = () => {
    setShowBar(!showBar);
    autoHide();
  };





  const fp = 12
  return !!props.children && <>
    <div
      style={{
        position: 'absolute',
        left: 5 * fp,
        bottom: 2 * fp,
        // right: 3 * @float-padding + 60px,
        height: 32,
        width: showBar ? `calc(100% - ${4 * fp}px - 36px)` : 0,
        background: '#fff',
        borderRadius: 3,
        boxShadow: '#aaa 3px 3px 5px 1px',
        transition: 'width 0.2s ease-out',
        visibility: showBar ? 'visible' : 'hidden'
      }}
    >
      {
        React.Children.map(props.children, _ => {
          return React.cloneElement(_ as any, { mutableSuit, showBar, menusStyle: { opacity: showBar ? 1 : 0, display: showBar ? 'block' : 'none' } })
        })
      }
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: 2 * fp,
        left: 2 * fp,
      }}
    >
      <Button
        icon={showBar ? <LeftOutlined /> : <RightOutlined />}
        shape={showBar ? 'circle' : null}
        style={{ boxShadow: '#aaa 3px 3px 5px 1px' }}
        className="btn"
        type="primary"
        onClick={toggleTool}
      />
    </div>

  </>;
}

export default Bar