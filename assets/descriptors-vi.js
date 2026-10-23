/* Bản dịch tiếng Việt của Band Descriptors (Writing Task 1, Task 2 và Speaking).
   Đây là bản dịch tham khảo do lớp The Standard thực hiện, không phải bản chính thức của IELTS.
   Cấu trúc giống hệt descriptors.js: mỗi tiêu chí có mảng theo band 0 đến 9, mỗi band là danh sách ý theo cùng thứ tự với bản tiếng Anh. */
(function () {
  function toObj(list) { var o = {}; list.forEach(function (a, b) { o[b] = a; }); return o; }

  var zeroW = ['không có mặt trong buổi thi', 'không cố gắng làm bài dưới bất kỳ hình thức nào', 'viết một bài đã học thuộc hoàn toàn'];

  /* Lexical Resource và Grammatical Range and Accuracy của Task 1 và Task 2 giống nhau. */
  var lr = [
    zeroW,
    ['chỉ dùng được vài từ rời rạc'],
    ['dùng vốn từ cực kỳ hạn chế; gần như không kiểm soát được cấu tạo từ và/hoặc chính tả'],
    ['chỉ dùng một số rất ít từ và cách diễn đạt, kiểm soát cấu tạo từ và/hoặc chính tả rất kém', 'lỗi có thể làm sai lệch nghiêm trọng thông điệp'],
    ['chỉ dùng từ vựng cơ bản, có thể bị lặp lại hoặc không phù hợp với đề bài', 'kiểm soát hạn chế cấu tạo từ và/hoặc chính tả; lỗi có thể khiến người đọc phải vất vả'],
    ['dùng vốn từ hạn chế, nhưng chỉ đủ ở mức tối thiểu cho đề bài', 'có thể mắc lỗi chính tả và/hoặc cấu tạo từ dễ nhận thấy, gây một chút khó khăn cho người đọc'],
    ['dùng vốn từ vừa đủ cho đề bài', 'cố gắng dùng từ ít phổ biến hơn nhưng có phần thiếu chính xác', 'mắc một số lỗi chính tả và/hoặc cấu tạo từ, nhưng không cản trở việc truyền đạt'],
    ['dùng vốn từ đủ rộng để có một mức độ linh hoạt và chính xác', 'dùng các từ ít phổ biến với một mức nhận thức về văn phong và kết hợp từ (collocation)', 'thỉnh thoảng có thể mắc lỗi chọn từ, chính tả và/hoặc cấu tạo từ'],
    ['dùng vốn từ rộng một cách trôi chảy và linh hoạt để truyền đạt ý nghĩa chính xác', 'dùng khéo léo các từ ít gặp, nhưng thỉnh thoảng có thể thiếu chính xác khi chọn từ và kết hợp từ', 'hiếm khi mắc lỗi chính tả và/hoặc cấu tạo từ'],
    ['dùng vốn từ rộng, kiểm soát các đặc điểm từ vựng rất tự nhiên và tinh tế; chỉ có lỗi nhỏ hiếm gặp ở mức “lỡ tay” (slips)']
  ];
  var gra = [
    zeroW,
    ['hoàn toàn không dùng được các dạng câu'],
    ['không dùng được các dạng câu, trừ những cụm từ đã học thuộc'],
    ['cố gắng dùng các dạng câu nhưng lỗi ngữ pháp và dấu câu chiếm ưu thế và làm sai lệch ý nghĩa'],
    ['chỉ dùng một phạm vi cấu trúc rất hạn chế, hiếm khi dùng mệnh đề phụ', 'một số cấu trúc đúng nhưng lỗi chiếm ưu thế, và dấu câu thường sai'],
    ['chỉ dùng một phạm vi cấu trúc hạn chế', 'cố gắng viết câu phức nhưng thường kém chính xác hơn câu đơn', 'có thể mắc nhiều lỗi ngữ pháp và dấu câu có thể sai; lỗi có thể gây một chút khó khăn cho người đọc'],
    ['dùng kết hợp câu đơn và câu phức', 'mắc một số lỗi ngữ pháp và dấu câu nhưng hiếm khi làm giảm khả năng truyền đạt'],
    ['dùng nhiều cấu trúc phức khác nhau', 'thường xuyên viết được câu không có lỗi', 'kiểm soát tốt ngữ pháp và dấu câu nhưng có thể mắc một vài lỗi'],
    ['dùng nhiều loại cấu trúc', 'phần lớn các câu không có lỗi', 'chỉ thỉnh thoảng mắc lỗi hoặc dùng chưa phù hợp'],
    ['dùng nhiều loại cấu trúc một cách linh hoạt và chính xác hoàn toàn; chỉ có lỗi nhỏ hiếm gặp ở mức “lỡ tay” (slips)']
  ];

  var t1ta = [
    zeroW,
    ['bài viết hoàn toàn không liên quan đến đề bài'],
    ['bài viết gần như không liên quan đến đề bài'],
    ['không giải quyết được đề bài, có thể đã hiểu sai hoàn toàn', 'đưa ra ít ý, phần lớn không liên quan hoặc lặp lại'],
    ['cố gắng giải quyết đề bài nhưng không bao quát hết các đặc điểm chính/các ý chính; hình thức có thể không phù hợp', 'có thể nhầm các đặc điểm chính/các ý chính với chi tiết; một số phần có thể không rõ, không liên quan, lặp lại hoặc không chính xác'],
    ['nhìn chung giải quyết được đề bài; hình thức có thể không phù hợp ở một số chỗ', 'kể lại chi tiết một cách máy móc, không có phần tổng quan rõ ràng; có thể không có số liệu để hỗ trợ phần mô tả', 'trình bày nhưng chưa bao quát đủ các đặc điểm chính/các ý chính; có thể có xu hướng tập trung vào chi tiết'],
    ['đáp ứng các yêu cầu của đề bài', 'có phần tổng quan với thông tin được chọn lọc phù hợp', 'trình bày và làm nổi bật đủ các đặc điểm chính/các ý chính nhưng chi tiết có thể không liên quan, không phù hợp hoặc không chính xác'],
    ['bao quát các yêu cầu của đề bài', 'có phần tổng quan rõ ràng về các xu hướng, điểm khác biệt hoặc các giai đoạn chính', 'trình bày và làm nổi bật rõ các đặc điểm chính/các ý chính nhưng có thể được phát triển đầy đủ hơn'],
    ['bao quát đầy đủ mọi yêu cầu của đề bài', 'trình bày, làm nổi bật và minh họa rõ ràng, phù hợp các đặc điểm chính/các ý chính'],
    ['đáp ứng trọn vẹn mọi yêu cầu của đề bài', 'trình bày một bài viết được phát triển đầy đủ, rõ ràng']
  ];
  var t1cc = [
    zeroW,
    ['không truyền đạt được thông điệp nào'],
    ['kiểm soát rất kém các đặc điểm tổ chức bài viết'],
    ['không sắp xếp ý một cách logic', 'có thể dùng rất ít phương tiện liên kết, và những phương tiện được dùng có thể không thể hiện mối quan hệ logic giữa các ý'],
    ['trình bày thông tin và ý tưởng nhưng chúng không được sắp xếp mạch lạc và bài viết không có sự tiến triển rõ ràng', 'dùng một số phương tiện liên kết cơ bản nhưng có thể không chính xác hoặc lặp lại'],
    ['trình bày thông tin có một mức độ tổ chức nhưng có thể thiếu sự tiến triển chung', 'dùng phương tiện liên kết không đủ, không chính xác hoặc lạm dụng', 'có thể lặp lại do thiếu quy chiếu (referencing) và thay thế từ (substitution)'],
    ['sắp xếp thông tin và ý tưởng mạch lạc và có sự tiến triển chung rõ ràng', 'dùng phương tiện liên kết hiệu quả, nhưng liên kết trong và/hoặc giữa các câu có thể sai hoặc máy móc', 'không phải lúc nào cũng dùng quy chiếu rõ ràng hoặc phù hợp'],
    ['sắp xếp thông tin và ý tưởng theo logic; có sự tiến triển rõ ràng xuyên suốt', 'dùng nhiều loại phương tiện liên kết phù hợp dù có thể có chỗ dùng thiếu hoặc thừa'],
    ['sắp xếp thông tin và ý tưởng theo trình tự hợp lý', 'xử lý tốt mọi khía cạnh của liên kết', 'chia đoạn đủ và phù hợp'],
    ['dùng liên kết một cách tự nhiên đến mức không gây chú ý', 'chia đoạn khéo léo']
  ];

  var t2ta = [
    zeroW,
    ['bài viết hoàn toàn không liên quan đến đề bài'],
    ['gần như không đáp ứng đề bài', 'không nêu quan điểm', 'có thể cố trình bày một hoặc hai ý nhưng không phát triển'],
    ['không giải quyết thỏa đáng bất kỳ phần nào của đề bài', 'không nêu quan điểm rõ ràng', 'đưa ra ít ý, phần lớn chưa được phát triển hoặc không liên quan'],
    ['đáp ứng đề bài ở mức tối thiểu hoặc bài lạc đề; hình thức có thể không phù hợp', 'có nêu quan điểm nhưng không rõ ràng', 'đưa ra một số ý chính nhưng khó nhận ra và có thể lặp lại, không liên quan hoặc được hỗ trợ kém'],
    ['chỉ đáp ứng đề bài một phần; hình thức có thể không phù hợp ở một số chỗ', 'nêu quan điểm nhưng phần phát triển không phải lúc nào cũng rõ và có thể không rút ra kết luận', 'đưa ra một số ý chính nhưng còn hạn chế và chưa được phát triển đủ; có thể có chi tiết không liên quan'],
    ['đáp ứng tất cả các phần của đề bài dù một số phần có thể được triển khai đầy đủ hơn các phần khác', 'nêu quan điểm phù hợp dù kết luận có thể trở nên không rõ hoặc lặp lại', 'đưa ra các ý chính phù hợp nhưng một số có thể được phát triển chưa đủ/không rõ'],
    ['đáp ứng tất cả các phần của đề bài', 'nêu quan điểm rõ ràng xuyên suốt bài viết', 'đưa ra, mở rộng và hỗ trợ các ý chính, nhưng có thể có xu hướng khái quát quá mức và/hoặc các ý hỗ trợ có thể thiếu tập trung'],
    ['đáp ứng đầy đủ tất cả các phần của đề bài', 'trình bày bài viết được phát triển tốt với các ý phù hợp, được mở rộng và được hỗ trợ'],
    ['đáp ứng trọn vẹn tất cả các phần của đề bài', 'trình bày quan điểm được phát triển đầy đủ để trả lời câu hỏi, với các ý phù hợp, được mở rộng trọn vẹn và được hỗ trợ tốt']
  ];
  var t2cc = [
    zeroW,
    ['không truyền đạt được thông điệp nào'],
    ['kiểm soát rất kém các đặc điểm tổ chức bài viết'],
    ['không sắp xếp ý một cách logic', 'có thể dùng rất ít phương tiện liên kết, và những phương tiện được dùng có thể không thể hiện mối quan hệ logic giữa các ý'],
    ['trình bày thông tin và ý tưởng nhưng chúng không được sắp xếp mạch lạc và bài viết không có sự tiến triển rõ ràng', 'dùng một số phương tiện liên kết cơ bản nhưng có thể không chính xác hoặc lặp lại', 'có thể không viết thành đoạn văn hoặc cách chia đoạn có thể gây khó hiểu'],
    ['trình bày thông tin có một mức độ tổ chức nhưng có thể thiếu sự tiến triển chung', 'dùng phương tiện liên kết không đủ, không chính xác hoặc lạm dụng', 'có thể lặp lại do thiếu quy chiếu (referencing) và thay thế từ (substitution)', 'có thể không viết thành đoạn văn, hoặc cách chia đoạn chưa đạt'],
    ['sắp xếp thông tin và ý tưởng mạch lạc và có sự tiến triển chung rõ ràng', 'dùng phương tiện liên kết hiệu quả, nhưng liên kết trong và/hoặc giữa các câu có thể sai hoặc máy móc', 'không phải lúc nào cũng dùng quy chiếu rõ ràng hoặc phù hợp', 'có chia đoạn, nhưng không phải lúc nào cũng hợp lý'],
    ['sắp xếp thông tin và ý tưởng theo logic; có sự tiến triển rõ ràng xuyên suốt', 'dùng nhiều loại phương tiện liên kết phù hợp dù có thể có chỗ dùng thiếu hoặc thừa', 'mỗi đoạn có một chủ đề trung tâm rõ ràng'],
    ['sắp xếp thông tin và ý tưởng theo trình tự hợp lý', 'xử lý tốt mọi khía cạnh của liên kết', 'chia đoạn đủ và phù hợp'],
    ['dùng liên kết một cách tự nhiên đến mức không gây chú ý', 'chia đoạn khéo léo']
  ];

  var sfc = [
    ['Không có mặt / Không hoàn thành bài thi'],
    ['Gần như không có.', 'Lời nói hoàn toàn không mạch lạc.'],
    ['Ngập ngừng kéo dài trước gần như mỗi từ.', 'Có thể nhận ra vài từ rời rạc nhưng lời nói hầu như không có giá trị giao tiếp.'],
    ['Thường xuyên ngập ngừng, có lúc rất lâu, khi thí sinh tìm từ.', 'Khả năng nối các câu đơn và nói vượt ra ngoài câu trả lời đơn giản còn hạn chế.', 'Thường không truyền đạt được thông điệp cơ bản.'],
    ['Không thể nói tiếp mà không ngập ngừng rõ rệt.', 'Lời nói có thể chậm và lặp lại nhiều.', 'Thường tự sửa lỗi.', 'Có thể nối các câu đơn nhưng thường lặp lại từ nối.', 'Có một số chỗ mất mạch lạc.'],
    ['Thường nói tiếp được, nhưng phải dựa vào việc lặp lại, tự sửa lỗi và/hoặc nói chậm để làm được điều đó.', 'Sự ngập ngừng thường đi kèm việc tìm từ vựng và ngữ pháp khá cơ bản giữa câu.', 'Lạm dụng một số từ nối diễn ngôn (discourse markers), từ nối và các đặc điểm liên kết khác.', 'Lời nói phức tạp hơn thường gây mất trôi chảy nhưng ngôn ngữ đơn giản hơn có thể nói trôi chảy.'],
    ['Nói tiếp được và sẵn sàng nói những lượt nói dài.', 'Có lúc mất mạch lạc do ngập ngừng, lặp lại và/hoặc tự sửa lỗi.', 'Dùng nhiều loại từ nối diễn ngôn, từ nối và đặc điểm liên kết trong lời nói dù không phải lúc nào cũng phù hợp.'],
    ['Nói tiếp được và dễ dàng nói những lượt nói dài mà không có vẻ gắng sức.', 'Có thể có chút ngập ngừng, lặp lại và/hoặc tự sửa lỗi, thường giữa câu, cho thấy khó khăn khi tìm ngôn ngữ phù hợp. Tuy nhiên những điều này không ảnh hưởng đến sự mạch lạc.', 'Dùng linh hoạt các từ nối diễn ngôn, từ nối và đặc điểm liên kết trong lời nói.'],
    ['Trôi chảy, chỉ rất thỉnh thoảng lặp lại hoặc tự sửa lỗi.', 'Thỉnh thoảng có thể ngập ngừng để tìm từ hoặc ngữ pháp, nhưng phần lớn là do nội dung.', 'Phát triển chủ đề mạch lạc, phù hợp và liên quan.'],
    ['Trôi chảy, chỉ rất thỉnh thoảng lặp lại hoặc tự sửa lỗi.', 'Mọi sự ngập ngừng chỉ để chuẩn bị nội dung của câu nói tiếp theo, không phải để tìm từ hay ngữ pháp.', 'Lời nói phù hợp với tình huống và các đặc điểm liên kết hoàn toàn chấp nhận được.', 'Phát triển chủ đề hoàn toàn mạch lạc và được mở rộng phù hợp.']
  ];
  var slr = [
    ['Không có mặt / Không hoàn thành bài thi'],
    ['Không có vốn từ ngoài vài từ rời rạc.', 'Không thể giao tiếp.'],
    ['Vốn từ rất hạn chế. Câu nói chỉ gồm từ rời rạc hoặc câu đã học thuộc.', 'Gần như không giao tiếp được nếu không có sự hỗ trợ của cử chỉ, điệu bộ.'],
    ['Vốn từ giới hạn ở từ vựng đơn giản, chủ yếu để nói thông tin cá nhân.', 'Vốn từ không đủ cho các chủ đề không quen thuộc.'],
    ['Vốn từ đủ cho các chủ đề quen thuộc nhưng chỉ truyền đạt được ý nghĩa cơ bản ở các chủ đề không quen thuộc.', 'Thường xuyên dùng từ không phù hợp và mắc lỗi chọn từ.', 'Hiếm khi cố diễn đạt lại (paraphrase).'],
    ['Vốn từ đủ để bàn về các chủ đề quen thuộc và không quen thuộc nhưng còn ít linh hoạt.', 'Cố diễn đạt lại nhưng không phải lúc nào cũng thành công.'],
    ['Vốn từ đủ để bàn về các chủ đề một cách dài.', 'Cách dùng từ có thể chưa phù hợp nhưng ý nghĩa vẫn rõ.', 'Nhìn chung diễn đạt lại thành công.'],
    ['Dùng vốn từ linh hoạt để bàn về nhiều chủ đề.', 'Có khả năng dùng một số từ ít phổ biến và thành ngữ, và có nhận thức về văn phong và kết hợp từ, dù vẫn có chỗ dùng chưa phù hợp.', 'Diễn đạt lại hiệu quả khi cần.'],
    ['Vốn từ rộng, được dùng dễ dàng và linh hoạt để bàn về mọi chủ đề và truyền đạt ý nghĩa chính xác.', 'Dùng khéo léo các từ ít phổ biến và thành ngữ dù thỉnh thoảng có chỗ chọn từ và kết hợp từ chưa chính xác.', 'Diễn đạt lại hiệu quả khi cần.'],
    ['Hoàn toàn linh hoạt và chính xác trong mọi ngữ cảnh.', 'Duy trì việc dùng ngôn ngữ chính xác và có tính thành ngữ.']
  ];
  var sgra = [
    ['Không có mặt / Không hoàn thành bài thi'],
    ['Không có ngôn ngữ có thể chấm điểm, trừ khi là câu học thuộc.'],
    ['Không có bằng chứng về các dạng câu cơ bản.'],
    ['Có cố dùng các dạng câu cơ bản nhưng lỗi ngữ pháp rất nhiều, trừ những câu có vẻ đã học thuộc.'],
    ['Có thể nói các dạng câu cơ bản và một số câu ngắn không có lỗi.', 'Mệnh đề phụ hiếm gặp và nhìn chung các lượt nói ngắn, cấu trúc lặp lại và lỗi xuất hiện thường xuyên.'],
    ['Các dạng câu cơ bản được kiểm soát khá chính xác.', 'Có cố dùng cấu trúc phức nhưng phạm vi hạn chế, hầu như luôn có lỗi và có thể phải nói lại cho đúng.'],
    ['Nói kết hợp câu ngắn và câu phức và nhiều loại cấu trúc nhưng ít linh hoạt.', 'Dù thường mắc lỗi ở cấu trúc phức, những lỗi này hiếm khi cản trở giao tiếp.'],
    ['Dùng linh hoạt nhiều loại cấu trúc. Thường xuyên nói được câu không có lỗi.', 'Dùng hiệu quả cả câu đơn và câu phức dù có một số lỗi. Vẫn còn một vài lỗi cơ bản.'],
    ['Nhiều loại cấu trúc, được dùng linh hoạt.', 'Phần lớn các câu không có lỗi.', 'Thỉnh thoảng có chỗ dùng chưa phù hợp và lỗi không mang tính hệ thống. Có thể vẫn còn một vài lỗi cơ bản.'],
    ['Cấu trúc chính xác và đúng ở mọi lúc, ngoại trừ những “lỗi nói nhầm” (mistakes) thường thấy trong lời nói của người bản ngữ.']
  ];
  var sp = [
    ['Không có mặt / Không hoàn thành bài thi'],
    ['Thỉnh thoảng phát ra được một số từ và âm riêng lẻ có thể nhận ra, nhưng không truyền đạt được ý nghĩa tổng thể.', 'Không thể hiểu được.'],
    ['Dùng ít đặc điểm phát âm chấp nhận được (có thể do mẫu lời nói không đủ).', 'Các vấn đề chung về cách nói làm hỏng nỗ lực nói liền mạch.', 'Từ và âm riêng lẻ phần lớn bị phát âm sai và truyền đạt được rất ít ý nghĩa.', 'Thường không thể hiểu được.'],
    ['Có một số đặc điểm của band 2, và một số, nhưng không phải tất cả, các đặc điểm tích cực của band 4.'],
    ['Dùng một số đặc điểm phát âm chấp nhận được, nhưng phạm vi hạn chế.', 'Ngắt cụm (chunking) khá chấp nhận được, nhưng nhịp điệu chung thường xuyên bị lỗi.', 'Cố dùng ngữ điệu và trọng âm, nhưng kiểm soát còn hạn chế.', 'Từ hoặc âm riêng lẻ thường bị phát âm sai, gây thiếu rõ ràng.', 'Người nghe cần cố gắng để hiểu và có thể có những đoạn không thể hiểu được.'],
    ['Có tất cả các đặc điểm tích cực của band 4, và một số, nhưng không phải tất cả, các đặc điểm tích cực của band 6.'],
    ['Dùng nhiều đặc điểm phát âm, nhưng kiểm soát không đều.', 'Ngắt cụm nhìn chung phù hợp, nhưng nhịp điệu có thể bị ảnh hưởng do thiếu nhịp theo trọng âm (stress-timing) và/hoặc tốc độ nói nhanh.', 'Có dùng ngữ điệu và trọng âm hiệu quả ở một số chỗ, nhưng không duy trì được.', 'Từ hoặc âm riêng lẻ có thể bị phát âm sai nhưng chỉ thỉnh thoảng gây thiếu rõ ràng.', 'Nhìn chung có thể hiểu được xuyên suốt mà không cần nhiều cố gắng.'],
    ['Có tất cả các đặc điểm tích cực của band 6, và một số, nhưng không phải tất cả, các đặc điểm tích cực của band 8.'],
    ['Dùng nhiều đặc điểm phát âm để truyền đạt ý nghĩa chính xác và/hoặc tinh tế.', 'Duy trì được nhịp điệu phù hợp. Dùng linh hoạt trọng âm và ngữ điệu qua những câu nói dài, dù thỉnh thoảng có sai sót.', 'Có thể dễ dàng hiểu được xuyên suốt.', 'Giọng nói ảnh hưởng rất ít đến khả năng nghe hiểu.'],
    ['Dùng đầy đủ các đặc điểm phát âm để truyền đạt ý nghĩa chính xác và/hoặc tinh tế.', 'Duy trì xuyên suốt việc dùng linh hoạt các đặc điểm của lời nói liền mạch.', 'Có thể hiểu được xuyên suốt mà không tốn công.', 'Giọng nói không ảnh hưởng đến khả năng nghe hiểu.']
  ];

  window.BAND_DESC_VI = {
    t1: { ta: toObj(t1ta), cc: toObj(t1cc), lr: toObj(lr), gra: toObj(gra) },
    t2: { ta: toObj(t2ta), cc: toObj(t2cc), lr: toObj(lr), gra: toObj(gra) },
    s: { fc: toObj(sfc), lr: toObj(slr), gra: toObj(sgra), p: toObj(sp) }
  };
})();
