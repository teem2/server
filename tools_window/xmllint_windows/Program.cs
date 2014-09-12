// xmllint for Windows. This is based upon the open-source package xmllint.
// I adapted this file from Program.cs (see https://code.google.com/p/xmllint/source/browse/trunk/Program.cs).
// The problem with the original version is that errors are sent to stdout instead of stderr.


using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Schema;
using System.IO; 

namespace xmllint_windows
{

    class Program
    {



        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage: xmllint <filename>");
                return;
            }

            try
            {
                String filepath = args[0];

                XmlTextReader tr = new XmlTextReader(filepath);
                XmlValidatingReader r = new XmlValidatingReader(tr);
                r.ValidationType = ValidationType.None;
                try
                {
                    while (r.Read()) ;
                }
                catch (XmlException e)
                {
                    TextWriter stderr = Console.Error;

                    stderr.WriteLine(e.Message);
                    //stderr.WriteLine("Exception object Line, pos: (" + e.LineNumber + "," + e.LinePosition + ")");
                    //stderr.WriteLine("XmlReader Line, pos: (" + tr.LineNumber + "," + tr.LinePosition + ")");
                }
            }
            catch (Exception ex)
            {
                TextWriter stderr = Console.Error;
                stderr.WriteLine("Unexpected exception: " + ex.Message);
            }
        }

    }

}
