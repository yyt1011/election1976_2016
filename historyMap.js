import states from "./squareMap.js";

export default class HistoryMap {
  constructor(data, svg) {
    this.svg = svg;
    this.data = data;
    this.cleanData(); //call the function immediately
    this.source();
  }

  cleanData() {
    //structure of data
    console.log(this.data);
    //get which party won the election each time
    //build on states data, add year*11, winparty

    this.pretByState = d3
      .nest()
      .key((d) => d.state_po)
      .key((d) => d.year)
      .entries(this.data);
    this.pretByState.forEach((d) => {
      //sort state's data by votes for each election year
      //d.values contains 11 datasets, each ordered by candidatevotes
      d.values.forEach((y) => {
        y.values.sort((a, b) => b.candidatevotes - a.candidatevotes);
      });
      d.values.forEach((y) => {
        y.data = [
          {
            year: y.key,
            winner: y.values[0].candidate,
            winparty: y.values[0].party,
            votes: y.values[0].candidatevotes,
          },
        ];
      });
    });
    this.draw();
  }

  draw() {
    //draw the square map, each state is a state-g group
    const squaregroups = this.svg
      .selectAll("g")
      .data(this.pretByState)
      .enter()
      .append("g")
      .attr("class", "state")
      .attr("id", (d) => `${d.key}`)
      .attr(
        "transform",
        (d) =>
          "translate(" + states[0][d.key].x + "," + states[0][d.key].y + ")"
      );
    //get all the state-g groups and append 11 boxes to each of them
    const lis = document.querySelectorAll("g");
    lis.forEach((d) => {
      console.log(d);

      const statewrap = d3.select(`#${d.id}`);
      //what's the difference between the method above and d3.select(d)
      const t = this.pretByState.filter((st) => {
        return st.key == d.id;
      })[0];

      statewrap
        .selectAll("rect")
        .data(this.pretByState.filter((st) => st.key == d.id)[0].values)
        .enter()
        .append("rect")
        .attr("width", 15)
        .attr("height", 16)
        .attr("class", "cube")
        .attr("data-year", (d) => d.data[0].year)
        .attr("data-winner", (d) => d.data[0].winner)
        .attr("data-winparty", (d) => d.data[0].winparty)
        .attr("transform", (d, i) => {
          if (i < 4) {
            return "translate(" + i * 16.5 + "," + 0 + ")";
          } else if (i < 8) {
            return "translate(" + (i - 4) * 16.5 + "," + 16.5 + ")";
          } else {
            return "translate(" + (i - 8) * 16.5 + "," + 16.5 * 2 + ")";
          }
        })
        .attr("stroke", "#ffffff")
        .attr("fill", (d) => {
          if (d.data[0].winparty == "democrat") {
            return "#3E4FF2";
          } else if (d.data[0].winparty == "republican") {
            return "#FA4145";
          } else {
            return "#cdcdcd";
          }
        })
        .attr("opacity", 0.8)
        .on("mouseover", handlerMouseOver)
        .on("mouseout", handlerMouseOut);

      const tooltip = document.querySelector("#tooltip");
      function handlerMouseOver() {
        d3.select(this).classed("selected", true);
        tooltip.style.top = event.pageY - 400 + "px";
        tooltip.style.left = event.pageX - 480 + "px";

        //show tooltip
        tooltip.style.display = "block";
        //table head
        tooltip.querySelector("table > caption").innerText = this.parentNode.id;
        //show year of election
        tooltip.querySelector(
          "table>tbody>tr>td:nth-child(2)"
        ).innerText = this.getAttribute("data-year");
        //show winner
        tooltip.querySelector(
          "table>tbody>tr:nth-child(2)>td:nth-child(2)"
        ).innerText = this.getAttribute("data-winner");

        // //show party
        tooltip.querySelector(
          "table>tbody>tr:last-child>td:nth-child(2)"
        ).innerText = this.getAttribute("data-winparty");
      }
      function handlerMouseOut() {
        d3.select(this).classed("selected", false);
        tooltip.style.display = "none";
      }
    });
  }
  source() {
    d3.select(".history-pret-result").append("div").attr("class", "source")
      .html(`Source of data:
    <a
      href="https://electionlab.mit.edu/data"
      alt="link to MIT Election Data Lab"
      >MIT Election Data + Science Lab</a
    >`);
  }
}
