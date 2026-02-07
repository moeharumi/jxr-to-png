/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", (ev) => {
        if (!ev.data) {
            return;
        } else if (ev.data.type === "deregister") {
            self.registration
                .unregister()
                .then(() => {
                    return self.clients.matchAll();
                })
                .then((clients) => {
                    clients.forEach((client) => client.navigate(client.url));
                });
        }
    });

    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }

        const request = (coepCredentialless && r.mode === "no-cors" && r.destination === "image") ?
            new Request(r, {
                credentials: "omit"
            }) :
            r;
        event.respondWith(
            fetch(request)
            .then((response) => {
                if (response.status === 0) {
                    return response;
                }

                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy",
                    coepCredentialless ? "credentialless" : "require-corp"
                );
                if (!coepCredentialless) {
                    newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
                }
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            })
            .catch((e) => console.error(e))
        );
    });

} else {
    (() => {
        const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
        window.sessionStorage.removeItem("coiReloadedBySelf");
        const coepDegrading = (reloadedBySelf == "coep");

        const n = navigator;
        const serviceWorker = n.serviceWorker;
        if (serviceWorker) {
            serviceWorker.addEventListener("controllerchange", () => {
                if (reloadedBySelf) return;
                window.location.reload();
            });

            if (reloadedBySelf) {
                console.log("coi-serviceworker reloaded the page");
            }
        }

        if (window.crossOriginIsolated) {
            return;
        }

        if (!serviceWorker) {
            return;
        }

        // 自动适配 basePath，假设 script 路径是相对根目录的
        const scriptPath = (document.currentScript && document.currentScript.src) || 'coi-serviceworker.js';
        
        serviceWorker.register(scriptPath).then(
            (registration) => {
                console.log("coi-serviceworker registered");

                registration.addEventListener("updatefound", () => {
                    if (reloadedBySelf) return;
                    console.log("coi-serviceworker detected update");
                    const newWorker = registration.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "activated") {
                            if (window.crossOriginIsolated) return;
                            window.sessionStorage.setItem("coiReloadedBySelf", "true");
                            window.location.reload();
                        }
                    });
                });
            },
            (err) => {
                console.error("coi-serviceworker registration failed: ", err);
            }
        );
    })();
}
