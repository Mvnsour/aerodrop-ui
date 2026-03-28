1. Create a basic static react/next app
2. Connect our walletwith a nicer connect app
3. Implement this function

```javascript
function airdropERC20(
        address tokenAddress, // ERC20 Token
        address[] calldata recipients, // List of recipients
        uint256[] calldata amounts, // 
        uint256 totalAmount //
    ) 
```
4. e2e testing
  1. When we connect we see the form
  2. When disconnected, we don't
5. Deploy to fleek