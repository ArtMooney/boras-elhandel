window.addEventListener("DOMContentLoaded", (event) => {
  function setWithExpiry(key, value, ttl) {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  async function getPriser(searchDate) {
    document.getElementById("loading-page").style.display = "flex";

    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    return fetch(
      "https://api.ngine.se/webhook/elhandel-priser?searchdate=" + searchDate,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        document.getElementById("loading-page").style.display = "none";
        return result;
      })
      .catch((error) => {
        document.getElementById("loading-page").style.display = "none";
        return error;
      });
  }

  function populateList(result) {
    if (result) {
      result = JSON.parse(result);
      var allDivs = document.querySelectorAll("div");
      var number = 0;
      var area = "SE" + (document.getElementById("elomrade").selectedIndex + 1);
      for (var a = 0; a < result.length; a++) {
        if (result[a].json.area === area) {
          document.getElementById("elpris-rubrik").innerHTML =
            result[a].json.date + " Snittpris (öre/kWh)";
          for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].getAttribute("average")) {
              allDivs[i].innerHTML = result[a].json.average;
            }
            if (allDivs[i].getAttribute("elpris")) {
              allDivs[i].innerHTML = result[a].json.hourly[number];
              number++;
            }
          }
        }
      }

      populateGraph(result, area);
    }
  }

  function populateTomorrowList(prices) {
    let pricesTomorrow = JSON.parse(prices);
    for (const [index, tomorrow] of pricesTomorrow.entries()) {
      pricesTomorrow[index].json.hourly = tomorrow.json.hourlytomorrow;
      pricesTomorrow[index].json.average = tomorrow.json.averagetomorrow;
      pricesTomorrow[index].json.date = tomorrow.json.datetomorrow;
    }

    populateList(JSON.stringify(pricesTomorrow));
  }

  function populateGraph(result, area) {
    for (var a = 0; a < result.length; a++) {
      if (result[a].json.area === area) {
        data.datasets[0].data = [];
        data.datasets[0].label = result[a].json.date;

        for (var i = 0; i < result[a].json.hourly.length; i++) {
          data.datasets[0].data.push(parseFloat(result[a].json.hourly[i]));
        }

        myChart.update();
      }
    }
  }

  function removeGraphCompare() {
    const chart = myChart;
    if (chart.data.datasets.length > 1) {
      chart.data.datasets.pop();
      chart.update();
    }
  }

  const labels = [
    "00-01",
    "01-02",
    "02-03",
    "03-04",
    "04-05",
    "05-06",
    "06-07",
    "07-08",
    "08-09",
    "09-10",
    "10-11",
    "11-12",
    "12-13",
    "13-14",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
    "20-21",
    "21-22",
    "22-23",
    "23-00",
  ];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "",
        backgroundColor: "rgb(57, 140, 174)",
        borderColor: "rgb(250, 222, 75)",
        data: [],
      },
    ],
  };
  const config = {
    type: "bar",
    data: data,
    options: {
      animations: {
        tension: {
          duration: 1000,
          easing: "linear",
          from: 1,
          to: 0,
          loop: true,
        },
      },
      scales: {
        y: {
          min: 0,
          display: true,
          title: {
            display: true,
            text: "öre/kWh",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                (Math.round(context.parsed.y * 100) / 100).toFixed(2) +
                " öre/kWh"
              );
            },
          },
        },
      },
    },
  };

  (function (factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
      // AMD. Register as an anonymous module.
      define(["../widgets/datepicker"], factory);
    } else {
      // Browser globals
      factory(jQuery.datepicker);
    }
  })(function (datepicker) {
    "use strict";

    datepicker.regional.sv = {
      closeText: "Stäng",
      prevText: "&#xAB;Förra",
      nextText: "Nästa&#xBB;",
      currentText: "Idag",
      monthNames: [
        "januari",
        "februari",
        "mars",
        "april",
        "maj",
        "juni",
        "juli",
        "augusti",
        "september",
        "oktober",
        "november",
        "december",
      ],
      monthNamesShort: [
        "jan.",
        "feb.",
        "mars",
        "apr.",
        "maj",
        "juni",
        "juli",
        "aug.",
        "sep.",
        "okt.",
        "nov.",
        "dec.",
      ],
      dayNamesShort: ["sön", "mån", "tis", "ons", "tor", "fre", "lör"],
      dayNames: [
        "söndag",
        "måndag",
        "tisdag",
        "onsdag",
        "torsdag",
        "fredag",
        "lördag",
      ],
      dayNamesMin: ["sö", "må", "ti", "on", "to", "fr", "lö"],
      weekHeader: "Ve",
      dateFormat: "yy-mm-dd",
      firstDay: 1,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: "",
    };
    datepicker.setDefaults(datepicker.regional.sv);

    return datepicker.regional.sv;
  });
  $("#datepicker").datepicker({
    maxDate: new Date(),
    minDate: new Date(2000, 1 - 1, 1),
    firstDay: 1,
  });
  $("#datepicker").on("change", function () {
    var event = new Event("input");
    var pickerInput = document.getElementById("datepicker");
    pickerInput.dispatchEvent(event);
  });
  $(function () {
    $("#calendar-icon").on("click", function (e) {
      $("#datepicker").datepicker("show");
    });
  });

  document.getElementById("elomrade").selectedIndex = "2";

  const myChart = new Chart(document.getElementById("myChart"), config);

  (async function start() {
    let date = new Date();
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    let inputDate = `${year}-${month}-${day}`;
    let prices;
    let searchedPrices;

    if (getWithExpiry("elhandel-priser") === null) {
      prices = await getPriser(inputDate);
      setWithExpiry(
        "elhandel-priser",
        JSON.stringify(JSON.parse(prices)),
        1000 * 60 * 15
      );
      populateList(prices);
    } else {
      prices = getWithExpiry("elhandel-priser");
      populateList(prices);
    }

    document
      .getElementById("elomrade")
      .addEventListener("change", async function () {
        if (getWithExpiry("elhandel-priser") === null) {
          prices = await getPriser(inputDate);
          setWithExpiry(
            "elhandel-priser",
            JSON.stringify(JSON.parse(prices)),
            1000 * 60 * 15
          );
        } else {
          prices = getWithExpiry("elhandel-priser");
        }

        if (document.getElementById("period").selectedIndex === 1) {
          populateTomorrowList(prices);
        } else if (document.getElementById("datepicker").value !== "") {
          populateList(searchedPrices);
        } else {
          populateList(prices);
        }
      });

    document
      .getElementById("period")
      .addEventListener("change", async function (event) {
        document.getElementById("datepicker").value = "";
        document.getElementById("jamfor").selectedIndex = 0;
        removeGraphCompare();
        document.getElementById("message").innerHTML = "-";
        document.getElementById("message-box").style.display = "none";

        if (getWithExpiry("elhandel-priser") === null) {
          prices = await getPriser(inputDate);
          setWithExpiry(
            "elhandel-priser",
            JSON.stringify(JSON.parse(prices)),
            1000 * 60 * 15
          );
        } else {
          prices = getWithExpiry("elhandel-priser");
        }

        const isPricesValid = JSON.parse(prices);

        if (event.target.selectedIndex === 0) {
          if (!isPricesValid[0]) {
            document.getElementById("message").innerHTML =
              "Ett fel inträffade när priserna skulle hämtas.";
            document.getElementById("message-box").style.display = "flex";
          } else {
            populateList(prices);
          }
        } else if (event.target.selectedIndex === 1) {
          if (!isPricesValid[0].json.hourlytomorrow) {
            document.getElementById("message").innerHTML =
              "Prisuppskattningen för morgondagens priser är tillgängliga varje dag från runt kl. 13.00.";
            document.getElementById("message-box").style.display = "flex";
          } else {
            populateTomorrowList(prices);
          }
        }
      });

    document
      .getElementById("datepicker")
      .addEventListener("input", async function (event) {
        document.getElementById("period").selectedIndex = 0;
        document.getElementById("jamfor").selectedIndex = 0;
        removeGraphCompare();
        document.getElementById("message").innerHTML = "-";
        document.getElementById("message-box").style.display = "none";

        let searchDate = document.getElementById("datepicker").value.split("-");
        searchDate = `${searchDate[0]}-${searchDate[1]}-${searchDate[2]}`;
        searchedPrices = await getPriser(searchDate);
        const isPricesValid = JSON.parse(searchedPrices);

        if (!isPricesValid[0]) {
          document.getElementById("message").innerHTML =
            "Ett fel inträffade när priserna skulle hämtas.";
          document.getElementById("message-box").style.display = "flex";
        } else {
          populateList(searchedPrices);
        }
      });

    document
      .getElementById("jamfor")
      .addEventListener("change", async function (event) {
        document.getElementById("period").selectedIndex = 0;
        document.getElementById("datepicker").value = "";
        document.getElementById("message").innerHTML = "-";
        document.getElementById("message-box").style.display = "none";
        document.getElementById("graf").click();
        let inputDate;

        if (event.target.selectedIndex === 0) {
          removeGraphCompare();
        } else if (event.target.selectedIndex === 1) {
          removeGraphCompare();
          populateList(prices);

          const pricesParsed = JSON.parse(prices);
          const area =
            "SE" + (document.getElementById("elomrade").selectedIndex + 1);
          data.datasets.push({
            label: "",
            backgroundColor: "rgb(27, 110, 144)",
            borderColor: "rgb(250, 222, 75)",
            data: [],
          });

          for (var a = 0; a < pricesParsed.length; a++) {
            if (pricesParsed[a].json.area === area) {
              data.datasets[1].label = pricesParsed[a].json.dateyesterday;
              for (
                var i = 0;
                i < pricesParsed[a].json.hourlyyesterday.length;
                i++
              ) {
                data.datasets[1].data.push(
                  parseFloat(pricesParsed[a].json.hourlyyesterday[i])
                );
              }

              myChart.update();
            }
          }
        } else if (event.target.selectedIndex === 2) {
          removeGraphCompare();

          const pricesParsed = JSON.parse(prices);
          const area =
            "SE" + (document.getElementById("elomrade").selectedIndex + 1);
          data.datasets.push({
            label: "",
            backgroundColor: "rgb(27, 110, 144)",
            borderColor: "rgb(250, 222, 75)",
            data: [],
          });

          for (var a = 0; a < pricesParsed.length; a++) {
            if (pricesParsed[a].json.area === area) {
              data.datasets[1].label = pricesParsed[a].json.datelastyear;
              for (
                var i = 0;
                i < pricesParsed[a].json.hourlylastyear.length;
                i++
              ) {
                data.datasets[1].data.push(
                  parseFloat(pricesParsed[a].json.hourlylastyear[i])
                );
              }

              myChart.update();
            }
          }
        }
      });
  })();
});
