const { createApp } = Vue;
const { shallowRef } = Vue;
const elprisApps = document.querySelectorAll("[elpriser-app]");

elprisApps.forEach((elprisApp) => {
  createApp({
    components: { Datepicker: VueDatePicker },
    data() {
      return {
        pricesWebhook:
          "https://api.ngine.se/webhook/elhandel-priser?searchdate=",
        tableHeading: "-",
        tableLabels: [
          "00 - 01",
          "01 - 02",
          "02 - 03",
          "03 - 04",
          "04 - 05",
          "05 - 06",
          "06 - 07",
          "07 - 08",
          "08 - 09",
          "09 - 10",
          "10 - 11",
          "11 - 12",
          "12 - 13",
          "13 - 14",
          "14 - 15",
          "15 - 16",
          "16 - 17",
          "17 - 18",
          "18 - 19",
          "19 - 20",
          "20 - 21",
          "21 - 22",
          "22 - 23",
          "23 - 00",
        ],

        chartType: "bar",
        chartData: {
          labels: [],
          datasets: [
            {
              label: "",
              backgroundColor: "rgb(57, 140, 174)",
              borderColor: "rgb(250, 222, 75)",
              data: [],
            },
          ],
        },
        chartOptions: {
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

        priceList: [],
        priceData: [],
        averagePrice: "-",
        selectArea: "3",
        selectPeriod: "1",
        selectDate: new Date(),
        selectCompare: "1",
        messageBox: "none",
        statusMessage: "-",
        myChart: {},
        addedLabel: " Snittpris (öre/kWh)",
        graph: "graph",
      };
    },

    async created() {
      const date = new Date();
      this.getPrices(date);
      this.chartData.labels = this.tableLabels.map((label) =>
        label.replaceAll(" ", "")
      );
    },

    methods: {
      getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) {
          return parts.pop().split(";").shift();
        }
      },

      async getPrices(date) {
        if (isNaN(Date.parse(date))) return; // make sure date is valid
        let priceData = this.priceData;

        // avoid fetching the same prices
        if (!this.priceData[0]) {
          const res = await fetch(
            this.pricesWebhook + this.getDateString(date)
          );
          priceData = await res.json();

          // create the chart
          this.createChart();
        } else {
          const datePart = this.priceData[0].json.searchdate.split(".");

          if (
            this.getDateString(date) !==
            `${datePart[2]}-${datePart[1]}-${datePart[0]}`
          ) {
            const res = await fetch(
              this.pricesWebhook + this.getDateString(date)
            );
            priceData = await res.json();
          }
        }

        // use price data to populate the app
        this.priceData = priceData;
        const area = parseInt(this.selectArea) - 1;

        if (this.selectPeriod === "2") {
          if (priceData[area].json.hourlytomorrow) {
            this.priceList = priceData[area].json.hourlytomorrow;
            this.tableHeading =
              priceData[area].json.datetomorrow + this.addedLabel;
            this.averagePrice = priceData[area].json.averagetomorrow;
          } else {
            this.statusMessage =
              "Prisuppskattningen för morgondagens priser är tillgängliga varje dag från runt kl. 13.00.";
            this.messageBox = "flex";
          }
        } else {
          this.statusMessage = "-";
          this.messageBox = "none";
          this.priceList = priceData[area].json.hourly;
          this.tableHeading = priceData[area].json.date + this.addedLabel;
          this.averagePrice = priceData[area].json.average;
        }

        this.updateChart();
      },

      createChart() {
        const chart = shallowRef(
          new Chart(this.$refs.myChart, {
            type: this.chartType,
            data: this.chartData,
            options: this.chartOptions,
          })
        );

        this.myChart = chart;
      },

      updateChart() {
        const chart = this.myChart;
        const chartData = this.chartData;
        const area = parseInt(this.selectArea) - 1;

        if (this.selectPeriod === "2") {
          this.chartData.datasets[0].data =
            this.priceData[area].json.hourlytomorrow;
          this.chartData.datasets[0].label =
            this.priceData[area].json.datetomorrow + this.addedLabel;
        } else {
          this.chartData.datasets[0].data = this.priceList;
          this.chartData.datasets[0].label = this.tableHeading;
        }

        if (this.selectCompare === "1") {
          this.removeDataset();
        } else if (this.selectCompare === "2") {
          if (chart.data.datasets.length > 1) {
            this.chartData.datasets[1].data =
              this.priceData[area].json.hourlyyesterday;
            this.chartData.datasets[1].label =
              this.priceData[area].json.dateyesterday + this.addedLabel;
          } else {
            this.chartData.datasets.push({
              label: this.priceData[area].json.dateyesterday + this.addedLabel,
              backgroundColor: "rgb(27, 110, 144)",
              borderColor: "rgb(250, 222, 75)",
              data: this.priceData[area].json.hourlyyesterday,
            });
          }
        } else if (this.selectCompare === "3") {
          if (chart.data.datasets.length > 1) {
            this.chartData.datasets[1].data =
              this.priceData[area].json.hourlylastyear;
            this.chartData.datasets[1].label =
              this.priceData[area].json.datelastyear + this.addedLabel;
          } else {
            this.chartData.datasets.push({
              label: this.priceData[area].json.datelastyear + this.addedLabel,
              backgroundColor: "rgb(27, 110, 144)",
              borderColor: "rgb(250, 222, 75)",
              data: this.priceData[area].json.hourlylastyear,
            });
          }
        }

        this.myChart.update();
      },

      removeDataset() {
        const chart = this.myChart;

        if (chart.data.datasets.length > 1) {
          chart.data.datasets.pop();
        }
      },

      getDateString(date) {
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);

        return `${year}-${month}-${day}`;
      },
    },

    watch: {
      selectArea(event) {
        this.getPrices(this.selectDate);
      },

      selectPeriod(event) {
        if (this.selectCompare === "1" || event === "2") {
          this.selectCompare = "1";
          this.removeDataset();

          if (event === "2") {
            this.selectDate = new Date();
          } else {
            this.getPrices(this.selectDate);
          }
        }
      },

      selectDate(date) {
        if (this.getDateString(date) !== this.getDateString(new Date())) {
          this.selectCompare = "1";
          this.removeDataset();
        }

        if (
          this.selectPeriod === "2" &&
          this.getDateString(date) !== this.getDateString(new Date())
        ) {
          this.selectPeriod = "1";
        }

        this.getPrices(date);
      },

      selectCompare(event) {
        this.$refs.graph.click();

        if (event !== "1") {
          this.selectPeriod = "1";
          this.selectDate = new Date();
        } else {
          this.removeDataset();
          this.updateChart();
        }
      },
    },
  }).mount(elprisApp);
});
