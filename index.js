/**
 *
 * @param {"move" | "close" | "init"} event
 * @param {{x: number, y: number} | undefined} data
 */
const messageBroadcast = (event, data) => {
  const totalTabs = +localStorage.getItem("totalTabs") || 0;
  switch (event) {
    case "init":
      console.log("init", totalTabs);
      if (totalTabs > 0) {
        document.getElementById("square-image").style.backgroundImage =
          "url(./images/hutao1.jpg)";
      }
      return localStorage.setItem("totalTabs", totalTabs + 1);
    case "close":
      console.log("close");
      return localStorage.setItem(
        "totalTabs",
        totalTabs === 0 ? 0 : totalTabs - 1
      );
  }
  localStorage.setItem(
    event,
    JSON.stringify({
      data,
      pointerBrowser: {
        x: window.screenX,
        y: window.screenY,
      },
    })
  );
  localStorage.removeItem(event);
};

/**
 *
 * @param {StorageEvent} e
 */
const message_receive = (e) => {
  console.log("move");

  const square = document.getElementById("square-image");
  const { data, pointerBrowser } = JSON.parse(e.newValue ?? "{}");
  if (!data || !pointerBrowser) return;
  const { x: sendX, y: sendY } = pointerBrowser;
  const { screenX, screenY } = window;
  square.style.left = `${data.x + sendX - screenX}px`;
  square.style.top = `${data.y + sendY - screenY}px`;
};

window.addEventListener("storage", message_receive);

window.onload = (e) => {
  const container = document.querySelector("#square-image");
  messageBroadcast("init");

  messageBroadcast("move", {
    x: window.screenX,
    y: window.screenY,
  });

  /**
   *
   * @param {{ movementX: number, movementY: number }} param
   */
  function onMouseDrag({ movementX, movementY }) {
    let getContainerStyle = window.getComputedStyle(container);
    let leftValue = (parseInt(getContainerStyle.left) || 0) + movementX;
    let topValue = parseInt(getContainerStyle.top) + 0 + movementY;

    container.style.left = `${leftValue}px`;
    container.style.top = `${topValue}px`;

    const data = {
      x: leftValue,
      y: topValue,
    };
    messageBroadcast("move", data);
  }

  container.addEventListener("mousedown", () => {
    container.addEventListener("mousemove", onMouseDrag);
  });

  document.addEventListener("mouseup", () => {
    container.removeEventListener("mousemove", onMouseDrag);
  });
};

window.addEventListener("beforeunload", () => messageBroadcast("close"));
