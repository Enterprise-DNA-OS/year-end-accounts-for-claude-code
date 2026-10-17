-- Fictional demo practice. Three year-end files at different stages, with deliberately overdue work.
insert into clients(id,code,name,entity_type,jurisdiction,currency,manager,partner) values
 ('10000000-0000-0000-0000-000000000001','CL-101','Harbour Joinery Demo Ltd','company','NZ','NZD','Aroha','Grant'),
 ('10000000-0000-0000-0000-000000000002','CL-102','Kauri Family Trust Demo','trust','NZ','NZD','Aroha','Grant'),
 ('10000000-0000-0000-0000-000000000003','CL-103','Swan Valley Cafe Demo Pty Ltd','company','AU','AUD','Priya','Grant') on conflict do nothing;
insert into engagements(id,code,client_id,period_start,period_end,due_on,return_due_on,preparer,reviewer,materiality_cents,status,terms_signed_on,terms_reference,prepared_on,reviewed_on) values
 ('20000000-0000-0000-0000-000000000001','YE26-101','10000000-0000-0000-0000-000000000001','2025-04-01','2026-03-31',current_date+12,current_date+40,'Aroha','Grant',500000,'open',current_date-60,'Engagement letter 2026, signed by director',null,null),
 ('20000000-0000-0000-0000-000000000002','YE26-102','10000000-0000-0000-0000-000000000002','2025-04-01','2026-03-31',current_date+5,current_date+40,'Aroha','Grant',300000,'prepared',null,'',current_date-6,null),
 ('20000000-0000-0000-0000-000000000003','YE26-103','10000000-0000-0000-0000-000000000003','2025-07-01','2026-06-30',current_date-3,current_date+25,'Priya','Grant',800000,'reviewed',current_date-75,'Terms of engagement FY26, signed by director',current_date-14,current_date-5) on conflict do nothing;
insert into tb_lines(id,engagement_id,account_code,account_name,report_line,workpaper,balance_cents,prior_cents) values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','1000','Bank','CASH','A1',4520000,1810000),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','1100','Trade debtors','REC','B1',3880000,3100000),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','1200','Stock on hand','INV','C1',2150000,2000000),
 ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','1500','Plant and equipment','PPE','D1',9600000,9600000),
 ('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000001','1510','Accumulated depreciation','PPE','D1',-2400000,-1440000),
 ('30000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000001','2000','Trade creditors','PAY','E1',-2960000,-2700000),
 ('30000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000001','2100','GST payable','GST','F1',-640000,-520000),
 ('30000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000001','2200','Shareholder current account','CUR','G1',-1200000,-900000),
 ('30000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000001','2500','Bank term loan','LOAN','H1',-5000000,-6000000),
 ('30000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000001','3000','Share capital','EQ','I1',-100000,-100000),
 ('30000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000001','3100','Retained earnings','EQ','I1',-4850000,-2470000),
 ('30000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000001','4000','Sales','REV','J1',-61200000,-52400000),
 ('30000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000001','4100','Interest received',null,'',-50000,-40000),
 ('30000000-0000-0000-0000-000000000014','20000000-0000-0000-0000-000000000001','5000','Cost of sales','COS','K1',33600000,29000000),
 ('30000000-0000-0000-0000-000000000015','20000000-0000-0000-0000-000000000001','6000','Wages and salaries','EXP','L1',14800000,13600000),
 ('30000000-0000-0000-0000-000000000016','20000000-0000-0000-0000-000000000001','6100','Rent','EXP','L1',3600000,3600000),
 ('30000000-0000-0000-0000-000000000017','20000000-0000-0000-0000-000000000001','6200','Motor vehicle expenses','EXP','L1',1250000,1100000),
 ('30000000-0000-0000-0000-000000000018','20000000-0000-0000-0000-000000000001','6300','General expenses','EXP','L1',5000000,1800000),
 ('30000000-0000-0000-0000-000000000019','20000000-0000-0000-0000-000000000001','6400','Depreciation','DEP','D1',0,960000),
 ('30000000-0000-0000-0000-000000000020','20000000-0000-0000-0000-000000000002','1000','Bank','CASH','A1',1250000,980000),
 ('30000000-0000-0000-0000-000000000021','20000000-0000-0000-0000-000000000002','1600','Rental property','PPE','D1',65000000,65000000),
 ('30000000-0000-0000-0000-000000000022','20000000-0000-0000-0000-000000000002','2500','Mortgage','LOAN','H1',-38000000,-39500000),
 ('30000000-0000-0000-0000-000000000023','20000000-0000-0000-0000-000000000002','2300','Beneficiary current accounts','CUR','G1',-2100000,-1500000),
 ('30000000-0000-0000-0000-000000000024','20000000-0000-0000-0000-000000000002','3000','Trust capital','EQ','I1',-20000000,-20000000),
 ('30000000-0000-0000-0000-000000000025','20000000-0000-0000-0000-000000000002','3100','Accumulated funds','EQ','I1',-5820000,-4790000),
 ('30000000-0000-0000-0000-000000000026','20000000-0000-0000-0000-000000000002','4200','Rental income','REV','J1',-3640000,-3380000),
 ('30000000-0000-0000-0000-000000000027','20000000-0000-0000-0000-000000000002','6500','Mortgage interest','EXP','L1',2280000,2450000),
 ('30000000-0000-0000-0000-000000000028','20000000-0000-0000-0000-000000000002','6600','Rates and insurance','EXP','L1',610000,560000),
 ('30000000-0000-0000-0000-000000000029','20000000-0000-0000-0000-000000000002','6700','Repairs and maintenance','EXP','L1',420000,180000),
 ('30000000-0000-0000-0000-000000000030','20000000-0000-0000-0000-000000000003','1000','Bank','CASH','A1',2640000,2100000),
 ('30000000-0000-0000-0000-000000000031','20000000-0000-0000-0000-000000000003','1200','Stock on hand','INV','C1',380000,350000),
 ('30000000-0000-0000-0000-000000000032','20000000-0000-0000-0000-000000000003','1500','Fitout and equipment','PPE','D1',8500000,8500000),
 ('30000000-0000-0000-0000-000000000033','20000000-0000-0000-0000-000000000003','1510','Accumulated depreciation','PPE','D1',-3400000,-2550000),
 ('30000000-0000-0000-0000-000000000034','20000000-0000-0000-0000-000000000003','2000','Trade creditors and accruals','PAY','E1',-920000,-860000),
 ('30000000-0000-0000-0000-000000000035','20000000-0000-0000-0000-000000000003','2100','GST and PAYG withholding','GST','F1',-450000,-410000),
 ('30000000-0000-0000-0000-000000000036','20000000-0000-0000-0000-000000000003','3000','Share capital','EQ','I1',-10000,-10000),
 ('30000000-0000-0000-0000-000000000037','20000000-0000-0000-0000-000000000003','3100','Retained earnings','EQ','I1',-2590000,-4970000),
 ('30000000-0000-0000-0000-000000000038','20000000-0000-0000-0000-000000000003','4000','Sales','REV','J1',-98400000,-91200000),
 ('30000000-0000-0000-0000-000000000039','20000000-0000-0000-0000-000000000003','5000','Purchases','COS','K1',31500000,29800000),
 ('30000000-0000-0000-0000-000000000040','20000000-0000-0000-0000-000000000003','6000','Wages','EXP','L1',44600000,41900000),
 ('30000000-0000-0000-0000-000000000041','20000000-0000-0000-0000-000000000003','6100','Rent','EXP','L1',13200000,12600000),
 ('30000000-0000-0000-0000-000000000042','20000000-0000-0000-0000-000000000003','6300','General expenses','EXP','L1',4100000,3900000),
 ('30000000-0000-0000-0000-000000000043','20000000-0000-0000-0000-000000000003','6400','Depreciation','DEP','D1',850000,850000) on conflict do nothing;
insert into adjustments(id,code,engagement_id,description,kind,status,proposed_by,posted_on,posted_by) values
 ('40000000-0000-0000-0000-000000000001','ADJ-101','20000000-0000-0000-0000-000000000001','Depreciation for the year on plant and equipment','adjusting','proposed','Aroha',null,''),
 ('40000000-0000-0000-0000-000000000002','ADJ-103','20000000-0000-0000-0000-000000000003','Wages accrued for the last week of June','adjusting','posted','Priya',current_date-15,'Priya') on conflict do nothing;
insert into adjustment_lines(id,adjustment_id,tb_line_id,amount_cents) values
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000019',960000),
 ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000005',-960000),
 ('50000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000040',250000),
 ('50000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000034',-250000) on conflict do nothing;
insert into workpapers(id,engagement_id,code,title,report_line,prepared_by,prepared_on,evidence_reference,conclusion,reviewed_by,reviewed_on) values
 ('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','A1','Bank reconciliation','CASH','Aroha',current_date-9,'Bank statement 31 March 2026','Agrees to the bank statement. Higher balance follows the loan repayment holiday ending in May.','',null),
 ('60000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','B1','Trade debtors','REC','Aroha',current_date-9,'Aged debtors report 31 March 2026','Aged listing agrees. Two balances over 90 days reviewed and collected after year end.','',null),
 ('60000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','D1','Fixed assets and depreciation','PPE','',null,'','','',null),
 ('60000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','J1','Revenue','REV','Aroha',current_date-8,'Sales by month report','Sales up 17 percent on two new commercial fit-out contracts. Monthly pattern consistent.','',null),
 ('60000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000001','K1','Cost of sales','COS','Aroha',current_date-8,'Supplier statements and stocktake sheet','Gross margin 45 percent against 45 percent last year.','',null),
 ('60000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000001','L1','Operating expenses','EXP','',null,'','','',null),
 ('60000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002','A1','Bank reconciliation','CASH','Aroha',current_date-7,'Bank statement 31 March 2026','Agrees to the bank statement.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000002','D1','Rental property','PPE','Aroha',current_date-7,'Title and rating valuation','Held at cost. No additions or disposals.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000002','G1','Beneficiary current accounts','CUR','Aroha',current_date-7,'Trustee resolution on distributions','Distributions credited as resolved by the trustees.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000002','H1','Mortgage','LOAN','Aroha',current_date-7,'Bank loan statement 31 March 2026','Agrees to the loan statement. Principal reduced by scheduled repayments.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000011','20000000-0000-0000-0000-000000000002','I1','Trust capital and accumulated funds','EQ','Aroha',current_date-6,'Prior year financial statements','Capital unchanged. Accumulated funds rolled from the ledger.','',null),
 ('60000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000002','J1','Rental income','REV','Aroha',current_date-6,'Property manager statements','Twelve monthly statements agree to income.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000002','L1','Property expenses','EXP','Aroha',current_date-6,'Rates notices, insurance schedule and invoices','Repairs higher after the roof repair in August.','Grant',current_date-3),
 ('60000000-0000-0000-0000-000000000014','20000000-0000-0000-0000-000000000003','A1','Bank reconciliation','CASH','Priya',current_date-16,'Bank statement 30 June 2026','Agrees to the bank statement.','Grant',current_date-6),
 ('60000000-0000-0000-0000-000000000015','20000000-0000-0000-0000-000000000003','D1','Fitout and depreciation','PPE','Priya',current_date-16,'Fixed asset register','Depreciation agrees to the register. No additions.','Grant',current_date-6),
 ('60000000-0000-0000-0000-000000000016','20000000-0000-0000-0000-000000000003','I1','Share capital and retained earnings','EQ','Priya',current_date-15,'Dividend minutes FY26','Opening retained earnings agree after the dividend declared in September.','Grant',current_date-6),
 ('60000000-0000-0000-0000-000000000017','20000000-0000-0000-0000-000000000003','J1','Sales','REV','Priya',current_date-15,'Point of sale summaries','Sales up 8 percent with longer weekend trading hours.','Grant',current_date-6),
 ('60000000-0000-0000-0000-000000000018','20000000-0000-0000-0000-000000000003','K1','Purchases','COS','Priya',current_date-15,'Supplier statements','Food cost 32 percent of sales, steady on last year.','Grant',current_date-6),
 ('60000000-0000-0000-0000-000000000019','20000000-0000-0000-0000-000000000003','L1','Wages, rent and overheads','EXP','Priya',current_date-14,'Payroll summary and lease','Wages follow the extra trading hours. Rent per the lease review.','Grant',current_date-6) on conflict do nothing;
insert into queries(id,code,engagement_id,question,owner,asked_on,due_on,status,answered_on,answer) values
 ('70000000-0000-0000-0000-000000000001','Q-101','20000000-0000-0000-0000-000000000001','Please send the bank term loan statement at 31 March 2026.','Aroha',current_date-20,current_date-6,'open',null,''),
 ('70000000-0000-0000-0000-000000000002','Q-102','20000000-0000-0000-0000-000000000001','What was the interest received in April for? It is not coded to an account we recognise.','Aroha',current_date-4,current_date+6,'open',null,''),
 ('70000000-0000-0000-0000-000000000003','Q-103','20000000-0000-0000-0000-000000000002','Please send the August roof repair invoice.','Aroha',current_date-15,current_date-8,'answered',current_date-10,'Invoice received from the trustee by email.') on conflict do nothing;
insert into review_points(id,code,engagement_id,workpaper,point,raised_by,raised_on,status,response,cleared_by,cleared_on) values
 ('80000000-0000-0000-0000-000000000001','RP-101','20000000-0000-0000-0000-000000000002','I1','Opening accumulated funds do not agree to last year''s closing balance. Confirm the distributions and any settlement entries.','Grant',current_date-9,'open','','',null),
 ('80000000-0000-0000-0000-000000000002','RP-102','20000000-0000-0000-0000-000000000003','L1','Confirm the wages accrual covers the final pay run.','Grant',current_date-10,'cleared','Accrual agrees to the 3 July pay run for the week ending 30 June.','Priya',current_date-7) on conflict do nothing;
insert into notes(id,engagement_id,actor,body) values
 ('90000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Aroha','Director away until next week. Loan statement chased by phone.') on conflict do nothing;
