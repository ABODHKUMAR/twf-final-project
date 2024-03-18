// routes/mincostRoute.js
const express = require('express')
const router = express.Router()
const mincostController = require('../controllers/mincostController')

router.post('/mincostCalculate', (req, res) => {
  try {
    let mp = new Map() // stores where the product required is in which warehouse and which location in that warehouse
    let weights = [] // weights[i][j] stores weight of jth item in ith warehouse
    let adj = [] // stores the adjacency list for the graph
    let n // number of warehouses
    let pathvis = new Set()
    let dp = new Map()

    function calc_cost (weight, dis) {
      // returns the total cost with given weight and unit distance to be traveled with that weight
      return Math.max(0, Math.ceil((weight - 5) / 5)) * 8 * dis + dis * 10
    }

    function rec (node, vis_mask, w_mask, mask_to_weight, req_mask) {
      let state = `${node}-${vis_mask}-${w_mask}` // Include w_mask in the state representation
      console.log('Entering rec function with state:', state)
      if (dp.has(state)) {
        console.log('Found in dp:', dp.get(state))
        return dp.get(state)
      }
      if (node === n && vis_mask === req_mask) {
        console.log('Reached destination with state:', state)
        return 0
      }
      if (pathvis.has(state)) {
        console.log('Found in pathvis:', 1e9)
        return 1e9
      }

      pathvis.add(state)
      let ans = 1e9
      if (node === n) {
        console.log('At depot, resetting w_mask to 0')
        w_mask = 0
      }

      for (let [to, dist] of adj[node]) {
        let cost_here = calc_cost(mask_to_weight[w_mask], dist)
        console.log(
          'Considering edge:',
          node,
          '->',
          to,
          'with distance:',
          dist,
          'and cost_here:',
          cost_here
        )
        ans = Math.min(
          ans,
          cost_here +
            rec(
              to,
              (vis_mask | (1 << to)) & req_mask,
              (w_mask | (1 << to)) & req_mask,
              mask_to_weight,
              req_mask
            )
        )
      }
      pathvis.delete(state)
      console.log('Setting dp with state and ans:', state, ans)
      dp.set(state, ans)
      return ans
    }

    function getMinCost (req) {
      console.log('Entering getMinCost function with req:', req)
      let weight_at_warehouse = Array(n).fill(0)
      dp.clear()
      let req_mask = 0
      for (let [item, quant] of req) {
        let warehouse = mp.get(item).warehouse
        let slot = mp.get(item).slot
        let weight_of_this_item = weights[warehouse][slot] * quant
        weight_at_warehouse[warehouse] += weight_of_this_item
        req_mask |= 1 << warehouse
      }
      let mask_to_weight = Array(1 << n).fill(1e9)
      for (let i = req_mask; i; i = (i - 1) & req_mask) {
        let w = 0
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) w += weight_at_warehouse[j]
        }
        mask_to_weight[i] = w
      }
      mask_to_weight[0] = 0
      let ans = 1e9
      for (let i = 0; i < n; i++) {
        if (req_mask & (1 << i))
          ans = Math.min(ans, rec(i, 1 << i, 1 << i, mask_to_weight, req_mask))
      }
      console.log('Returning answer:', ans)
      return ans
    }

    function solve () {
      n = 3
      adj = Array(n + 1)
        .fill()
        .map(() => [])
      adj[0].push([3, 3])
      adj[0].push([1, 4])
      adj[1].push([0, 4])
      adj[1].push([2, 3])
      adj[1].push([3, 2.5])
      adj[2].push([1, 3])
      adj[2].push([3, 2])
      adj[3].push([0, 3])
      adj[3].push([1, 2.5])
      adj[3].push([2, 2])

      for (let i = 0; i < 9; i++)
        mp.set(i, { warehouse: Math.floor(i / 3), slot: i % 3 })

      weights = [
        [3, 2, 8],
        [12, 25, 15],
        [0.5, 1, 2]
      ]
      let input=req.body;
      console.log(input);
      let re = Object.entries(input).map(([key, value]) => [key.charCodeAt(0) - 'A'.charCodeAt(0), value]);
    //   console.log('Minimum cost:', getMinCost(req))
      return getMinCost(re);
    }

    let mincost= solve()
    res.json({ mincost })
  } catch (error) {
    console.log('1')
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
