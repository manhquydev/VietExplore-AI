 ○ Compiling /api/address/provinces ...
 ✓ Compiled /api/address/provinces in 922ms (2715 modules)
Error fetching provinces: TypeError: Cannot convert argument to a ByteString because the character at index 4 has a value of 7883 which is greater than 255.
    at GET (src\app\api\address\provinces\route.ts:9:27)
   7 |     const mode = searchParams.get('mode') || '0'; // Default lấy tất cả (cũ và mới)
   8 |
>  9 |     const response = await fetch(`https://tailieu365.com/api/address/province?mode=${mode}`, {   
     |                           ^
  10 |       method: 'GET',
  11 |       headers: {
  12 |         'Accept': 'application/json',
 GET /api/address/provinces 500 in 1316ms
Error fetching provinces: TypeError: Cannot convert argument to a ByteString because the character at index 4 has a value of 7883 which is greater than 255.
    at GET (src\app\api\address\provinces\route.ts:9:27)
   7 |     const mode = searchParams.get('mode') || '0'; // Default lấy tất cả (cũ và mới)
   8 |
>  9 |     const response = await fetch(`https://tailieu365.com/api/address/province?mode=${mode}`, {   
     |                           ^
  10 |       method: 'GET',
  11 |       headers: {
  12 |         'Accept': 'application/json',
 GET /api/address/provinces 500 in 256ms