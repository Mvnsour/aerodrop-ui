function calculateTotal(amounts: string): number{
  // Split the amounts string by commas, convert to numbers, and sum them up
  const amountArray = amounts
    .split(/[\n,]+/) // Split by commas or new lines
    .map(amt => amt.trim()) // Trim whitespace
    .filter(amt => amt!== "") // Remove empty strings
    .map(amt => parseFloat(amt)); // Convert to numbers
  // Sum all valid numbers
    return amountArray
      .filter(num => !isNaN(num)) // Filter out NaN values
      .reduce((sum, num) => sum + num, 0); // Sum the numbers
}