self.addEventListener("push", event => {
  const data = event.data ?
    event.data.json() :
    {
      title: "MOLAS Update",
      body: "You have a new update from MOLAS."
    };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/molas.png",
      badge: "/molas.png",
      data: {
        url: data.url || "/"
      }
    })
  );
});


self.addEventListener("notificationclick", event => {
  
  event.notification.close();
  
  const url =
    event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.openWindow(url)
  );
  
});