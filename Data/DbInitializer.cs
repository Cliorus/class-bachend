using Microsoft.EntityFrameworkCore;
using ClassBackend.Models;

namespace ClassBackend.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // 如果已经有数据，不重复初始化
        if (context.StudentRosters.Any())
            return;

        // 班委学号列表
        var classLeaderIds = new HashSet<string> { "1", "6", "12", "13", "19", "37", "40", "45", "50" };

        // 从名单.xlsx读取数据（这里需要手动输入，因为无法在运行时读取xlsx）
        // 学号、用户名、识别码数据
        var rosterData = new[]
        {
            new { StudentId = "1", Username = "赵一凡", Code = "1" },
            new { StudentId = "2", Username = "杨伊诺", Code = "3" },
            new { StudentId = "3", Username = "王惠", Code = "5" },
            new { StudentId = "4", Username = "陈童晞", Code = "7" },
            new { StudentId = "5", Username = "刘铭辉", Code = "9" },
            new { StudentId = "6", Username = "马心怡", Code = "11" },
            new { StudentId = "7", Username = "毛浩丞", Code = "13" },
            new { StudentId = "8", Username = "吴雨锶", Code = "15" },
            new { StudentId = "9", Username = "刘明朗", Code = "17" },
            new { StudentId = "10", Username = "林轩铠", Code = "19" },
            new { StudentId = "11", Username = "林子瀚", Code = "21" },
            new { StudentId = "12", Username = "陈奕言", Code = "23" },
            new { StudentId = "13", Username = "林子暄", Code = "25" },
            new { StudentId = "14", Username = "郭芝含", Code = "27" },
            new { StudentId = "15", Username = "陈颢文", Code = "29" },
            new { StudentId = "16", Username = "薛舒议", Code = "31" },
            new { StudentId = "17", Username = "吴雨桐", Code = "33" },
            new { StudentId = "18", Username = "陈勃丞", Code = "35" },
            new { StudentId = "19", Username = "王凤翔", Code = "37" },
            new { StudentId = "20", Username = "刘思彤", Code = "39" },
            new { StudentId = "21", Username = "兰星瑶", Code = "41" },
            new { StudentId = "22", Username = "陈钰欣", Code = "43" },
            new { StudentId = "23", Username = "缪心妍", Code = "45" },
            new { StudentId = "24", Username = "张庭玮", Code = "47" },
            new { StudentId = "25", Username = "阮苏妍", Code = "49" },
            new { StudentId = "26", Username = "游益齐", Code = "51" },
            new { StudentId = "27", Username = "龚子涵", Code = "53" },
            new { StudentId = "28", Username = "郭城荣", Code = "55" },
            new { StudentId = "29", Username = "李晗玥", Code = "57" },
            new { StudentId = "30", Username = "谢舒妃", Code = "59" },
            new { StudentId = "31", Username = "刘妍宏", Code = "61" },
            new { StudentId = "32", Username = "薛晴", Code = "63" },
            new { StudentId = "33", Username = "王阳丞", Code = "65" },
            new { StudentId = "34", Username = "阮向睿", Code = "67" },
            new { StudentId = "35", Username = "谢舒冰", Code = "69" },
            new { StudentId = "36", Username = "余烨灵", Code = "71" },
            new { StudentId = "37", Username = "阮歆睿", Code = "73" },
            new { StudentId = "38", Username = "缪思瑶", Code = "75" },
            new { StudentId = "39", Username = "吴彦泽", Code = "77" },
            new { StudentId = "40", Username = "郑骐娜", Code = "79" },
            new { StudentId = "41", Username = "连思涵", Code = "81" },
            new { StudentId = "42", Username = "郑熠", Code = "83" },
            new { StudentId = "43", Username = "黄议宣", Code = "85" },
            new { StudentId = "44", Username = "阮晗喆", Code = "87" },
            new { StudentId = "45", Username = "王智弘", Code = "89" },
            new { StudentId = "46", Username = "陈彦彤", Code = "91" },
            new { StudentId = "47", Username = "缪严毅", Code = "93" },
            new { StudentId = "48", Username = "魏子淇", Code = "95" },
            new { StudentId = "49", Username = "陈品愫", Code = "97" },
            new { StudentId = "50", Username = "刘彦辰", Code = "99" },
            new { StudentId = "51", Username = "王钦灵", Code = "101" },
            new { StudentId = "52", Username = "陈天祺", Code = "103" },
            new { StudentId = "53", Username = "陈柯涵", Code = "105" },
            new { StudentId = "54", Username = "黄雨菲", Code = "107" },
            new { StudentId = "55", Username = "缪正航", Code = "109" },
            new { StudentId = "56", Username = "黄翊洋", Code = "111" },
            new { StudentId = "57", Username = "王张兆辰", Code = "113" },
            new { StudentId = "58", Username = "阮小迈", Code = "115" },
            new { StudentId = "59", Username = "王若惜", Code = "117" },
            new { StudentId = "60", Username = "饶恩祯", Code = "119" },
            new { StudentId = "61", Username = "沈炜彤", Code = "121" },
            new { StudentId = "a", Username = "缪斌斌", Code = "124" },
            new { StudentId = "b", Username = "丁燕容", Code = "127" },
            new { StudentId = "c", Username = "张旭华", Code = "130" },
            new { StudentId = "d", Username = "郑锦琴", Code = "133" },
            new { StudentId = "e", Username = "林晨", Code = "136" },
            new { StudentId = "f", Username = "余浩", Code = "139" }
        };

        for (int i = 0; i < rosterData.Length; i++)
        {
            var data = rosterData[i];
            var isTeacher = i >= 61; // 62-67行为教师（索引61-66）
            var isClassLeader = classLeaderIds.Contains(data.StudentId);

            context.StudentRosters.Add(new StudentRoster
            {
                StudentId = data.StudentId,
                Username = data.Username,
                Code = data.Code,
                IsTeacher = isTeacher,
                IsClassLeader = isClassLeader
            });
        }

        context.SaveChanges();
    }
}