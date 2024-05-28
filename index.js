// use channel
var bc = null;

/**
 *
 * @param {{
 *    data: {
 *      x:number,
 *      y:number
 *    },
 *    pointerBrowser:{
 *      x:number,
 *      y:number
 *    }}} param
 */
const message_receive = ({ data, pointerBrowser }) => {
  console.log("message_receive");
  const square = document.getElementById("square-image");
  if (!data || !pointerBrowser) return;
  const { x: sendX, y: sendY } = pointerBrowser;
  const { screenX, screenY } = window;
  square.style.left = `${data.x + sendX - screenX}px`;
  square.style.top = `${data.y + sendY - screenY}px`;
};

/**
 *
 * @param {}
 * @param {{
 *    event: "move" | "close" | "init",
 *    data: {x: number, y: number}
 *    pointerBrowser: {x: number, y: number}
 * }} data
 */

const messageBroadcast = ({ data }) => {
  const { event, data: param, pointerBrowser } = data;
  const totalTabs = +localStorage.getItem("totalTabs") || 0;
  switch (event) {
    case "init":
      console.log("init", totalTabs);
      if (totalTabs > 0) {
        document.getElementById("square-image").style.backgroundImage =
          "url(./images/hutao1.jpg)";
      }
      localStorage.setItem("totalTabs", totalTabs + 1);
      break;
    case "close":
      console.log("close");
      localStorage.setItem("totalTabs", totalTabs === 0 ? 0 : totalTabs - 1);
      break;
  }

  message_receive({
    data: param,
    pointerBrowser,
  });
};

window.onload = () => {
  !bc && (bc = new BroadcastChannel("channel-move-img"));
  bc.onmessage = messageBroadcast;
  bc.postMessage({
    event: "init",
    data: { x: 0, y: 0 },
    pointerBrowser: { x: window.screenX, y: window.screenY },
  });

  const container = document.querySelector("#square-image");

  /*
   * @param {{ movementX: number, movementY: number }} param
   */
  function onMouseDrag({ movementX, movementY }) {
    const getContainerStyle = window.getComputedStyle(container);
    const leftValue = (parseInt(getContainerStyle.left) || 0) + movementX;
    const topValue = parseInt(getContainerStyle.top) + 0 + movementY;

    container.style.left = `${leftValue}px`;
    container.style.top = `${topValue}px`;

    const data = {
      x: leftValue,
      y: topValue,
    };
    bc.postMessage({
      event: "move",
      data,
      pointerBrowser: { x: window.screenX, y: window.screenY },
    });
  }

  container.addEventListener("mousedown", () => {
    container.addEventListener("mousemove", onMouseDrag);
  });

  document.addEventListener("mouseup", () => {
    container.removeEventListener("mousemove", onMouseDrag);
  });
};

window.addEventListener("beforeunload", () => bc.close());
